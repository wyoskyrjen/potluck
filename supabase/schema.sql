-- Potluck backend schema for Supabase.
--
-- To apply: Supabase dashboard -> SQL Editor -> New query -> paste this whole file
-- -> Run. It is written to be re-runnable, so running it a second time after an edit
-- is safe and will not drop any data.
--
-- HEADS UP: running this file is not the whole setup. It leaves the site password
-- unset, and the gate rejects every attempt until you set one -- that is a separate
-- statement you run yourself, so the password never lands in this committed file. See
-- "Setting the password" near the bottom.

-- ===========================================================================
-- Tables
-- ===========================================================================

-- One row per person who signed up. Phone and comment are optional; the sign-up
-- page lists only the name and the comment.
create table if not exists public.signups (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null check (length(trim(name)) > 0),
  phone      text        not null default '',
  -- Mirrors COMMENT_MAX_LENGTH in src/signups.js, which is also the textarea's
  -- maxLength. The check is here so a hand-rolled API call can't exceed it either.
  comment    text        not null default '' check (length(comment) <= 200),
  created_at timestamptz not null default now()
);

-- The app matches names case- and whitespace-insensitively, so signing up as
-- "jenna " updates Jenna's existing row instead of creating a second one. The app
-- checks for a match before it writes; this index is what guarantees uniqueness
-- even if two people submit the same name at the same moment.
create unique index if not exists signups_name_key
  on public.signups ((lower(trim(name))));

-- One row per dish on the menu. `diets` holds ids from the DIETS list in
-- src/menu.js; `ingredients` holds one element per ingredient, in the order the
-- person typed them into the form.
create table if not exists public.menu_items (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null check (length(trim(name)) > 0),
  bringer     text        not null default '',
  diets       text[]      not null default '{}',
  ingredients text[]      not null default '{}',
  created_at  timestamptz not null default now()
);

-- Both list pages order by created_at so the newest entry sorts last.
create index if not exists signups_created_at_idx    on public.signups (created_at);
create index if not exists menu_items_created_at_idx on public.menu_items (created_at);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
-- Read this section before changing it.
--
-- Vite inlines VITE_SUPABASE_ANON_KEY into the JavaScript bundle at build time, and
-- that bundle is committed in docs/ and served publicly. The anon key is therefore
-- public by design -- anyone can read it out of the bundle and call the API with it.
-- These policies are the ONLY thing limiting what a visitor can do.
--
-- Potluck has no login, and the whole point is that any guest can sign themselves up
-- and add a dish. So the policies below deliberately allow anyone to read, insert,
-- and update -- exactly the operations the UI offers, and nothing more. There is no
-- delete policy, because the app has no delete button; deletes are still possible
-- from the dashboard, which uses the privileged service role and bypasses RLS.
--
-- Consequence worth knowing: anyone can also read the `phone` column, and anyone can
-- overwrite or rename someone else's sign-up. See README-supabase.md for how to
-- tighten this if you ever want to.

alter table public.signups    enable row level security;
alter table public.menu_items enable row level security;

-- Postgres has no CREATE POLICY IF NOT EXISTS, so drop-then-create keeps this file
-- re-runnable.
drop policy if exists "Anyone can read signups"     on public.signups;
drop policy if exists "Anyone can add a signup"     on public.signups;
drop policy if exists "Anyone can edit a signup"    on public.signups;
drop policy if exists "Anyone can read menu items"  on public.menu_items;
drop policy if exists "Anyone can add a menu item"  on public.menu_items;
drop policy if exists "Anyone can edit a menu item" on public.menu_items;

create policy "Anyone can read signups"
  on public.signups for select
  to anon, authenticated
  using (true);

create policy "Anyone can add a signup"
  on public.signups for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can edit a signup"
  on public.signups for update
  to anon, authenticated
  using (true) with check (true);

create policy "Anyone can read menu items"
  on public.menu_items for select
  to anon, authenticated
  using (true);

create policy "Anyone can add a menu item"
  on public.menu_items for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can edit a menu item"
  on public.menu_items for update
  to anon, authenticated
  using (true) with check (true);

-- ===========================================================================
-- Site password gate
-- ===========================================================================
-- The password is deliberately NOT stored in the React code or in an env var. Vite
-- inlines env vars into the bundle, and the bundle is committed to docs/ and served
-- publicly -- a password there would be readable by anyone who opened devtools.
--
-- Instead: only a bcrypt hash is stored, in a table the anon key cannot read at all,
-- and the only thing exposed to the browser is verify_site_password(), which takes an
-- attempt and answers true or false. The password and its hash never leave the
-- database. See README-supabase.md for what this does and does not protect.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.site_password (
  id         int         primary key generated always as identity,
  hash       text        not null,
  created_at timestamptz not null default now()
);

-- RLS on with NO policies, deliberately: nothing grants read access, so anon and
-- authenticated can never select this row. The revoke is belt-and-braces against
-- Supabase's default grants on new tables in public.
alter table public.site_password enable row level security;
revoke all on table public.site_password from anon, authenticated;

-- `security definer` makes the function run as its owner, which is what lets it read
-- the table its caller cannot. The pinned search_path is required with security definer
-- -- without it a caller could shadow `crypt` with their own function and change what
-- this one does.
create or replace function public.verify_site_password(attempt text)
returns boolean
language plpgsql
security definer
set search_path = extensions, public, pg_temp
as $$
declare
  stored text;
begin
  select hash into stored
    from public.site_password
   order by created_at desc
   limit 1;

  -- No password set yet: refuse everything rather than letting everyone in.
  if stored is null then
    return false;
  end if;

  -- crypt() re-hashes the attempt using the salt embedded in the stored hash, so
  -- equality means the password matched. Only the boolean goes back to the browser.
  return crypt(attempt, stored) = stored;
end;
$$;

revoke all on function public.verify_site_password(text) from public;
grant execute on function public.verify_site_password(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Setting the password
-- ---------------------------------------------------------------------------
-- Until this is done the gate rejects every password, because verify_site_password()
-- refuses everything when the table is empty.
--
-- Run this ONE statement on its own in the SQL Editor, with your own password
-- substituted in. Do not save the real password into this file: this file is
-- committed, so it would live in the repo's history forever. Only the hash is stored.
--
--   delete from public.site_password;
--   insert into public.site_password (hash)
--   values (extensions.crypt('YOUR-PASSWORD-HERE', extensions.gen_salt('bf')));
--
-- Re-run it any time to change the password. If Postgres says schema `extensions` does
-- not exist, drop both prefixes and use plain crypt() / gen_salt() -- pgcrypto is
-- installed somewhere already on the search_path.
--
-- Then check it worked, which also confirms the function is callable:
--
--   select public.verify_site_password('YOUR-PASSWORD-HERE') as should_be_true,
--          public.verify_site_password('definitely-wrong')   as should_be_false;

-- ===========================================================================
-- Optional seed data
-- ===========================================================================
-- Uncomment and run this block if you want a couple of rows to confirm the wiring
-- works end to end. Delete them afterwards from the Table Editor.
--
-- insert into public.signups (name, phone, comment) values
--   ('Jenna',  '', 'Hosting -- bringing the grill and lemonade'),
--   ('Marcus', '', 'Running late, save me a plate');
--
-- insert into public.menu_items (name, bringer, diets, ingredients) values
--   ('Watermelon Salad', 'Jenna',  array['vegetarian','vegan','gluten-free'],
--    array['watermelon', 'feta', 'mint', 'lime']),
--   ('Pasta Salad',      'Marcus', array['vegetarian'],
--    array['rotini', 'cherry tomatoes', 'basil', 'olive oil']);
