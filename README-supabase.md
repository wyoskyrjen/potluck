# Supabase backend — setup and notes

Sign-ups and menu items are stored in Supabase instead of `localStorage`, so everyone
who loads the site sees the same list.

Project: <https://okeocqjxpeqsvqmozxgv.supabase.co>

## One-time setup

1. **Create the tables.** Open the Supabase dashboard → **SQL Editor** → **New query**,
   paste the whole of [`supabase/schema.sql`](supabase/schema.sql), and **Run**. It
   creates the tables, the indexes, the Row Level Security policies, and the password
   gate. The file is re-runnable, so you can edit and re-run it later without losing
   data. It does **not** set the site password — see [Site password
   gate](#site-password-gate) for the one statement that does.

2. **Add your keys locally.** Copy `.env.example` to `.env.local` and paste in the anon
   key from the dashboard (**Project Settings → API Keys**):

   ```
   VITE_SUPABASE_URL=https://okeocqjxpeqsvqmozxgv.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

   Use the **anon / publishable** key. Never the `service_role` / secret key — that one
   bypasses Row Level Security and must never appear in client-side code.

   `.env.local` is already gitignored by the existing `*.local` rule.

3. **Restart the dev server.** Vite only reads env files at startup, so `npm run dev`
   has to be restarted after creating `.env.local`.

If the env vars are missing, the pages render normally but show "Supabase is not
configured…" where the data would be.

## Deploying

`npm run build` inlines both env vars into the bundle in `docs/`, so `.env.local` must
be present on the machine that runs the build. Then commit `docs/` and push, as before.

## What's in the database

| Table           | Columns                                                     |
| --------------- | ----------------------------------------------------------- |
| `signups`       | `id`, `name`, `phone`, `comment`, `created_at`               |
| `menu_items`    | `id`, `name`, `bringer`, `diets[]`, `ingredients[]`, `created_at` |
| `site_password` | `id`, `hash`, `created_at` — not readable by the anon key    |

`diets` holds ids from the `DIETS` list in [`src/menu.js`](src/menu.js). The two lists
are intentionally *not* constrained in SQL, so adding a sixth diet stays a one-file
change. The trade-off is that a typo'd id would be stored happily and just not render a
badge.

`signups` has a unique index on the lower-cased, trimmed name, which is what makes
"jenna " update Jenna's row instead of adding a second one.

## Security — read this before changing the policies

Vite inlines `VITE_SUPABASE_ANON_KEY` into the JavaScript bundle at build time, and that
bundle is committed to `docs/` and served publicly. **The anon key is public**, by
design. Anyone can read it out of the deployed site and call the API directly. The RLS
policies in `schema.sql` are the only thing limiting what they can do.

Those policies currently allow **anyone to read, insert, and update** rows in both
tables — the same operations the UI offers. For a no-login potluck sign-up sheet that's
the intended behaviour, but it does mean:

- **`phone` is publicly readable.** It isn't shown anywhere in the UI, but it is in the
  table, and the update form has to read it back to pre-fill the field. Anyone with the
  anon key can query it. If that matters, the cleanest fix is to stop storing phone
  numbers at all; the alternative is adding a login so only the host can read them.
- **Anyone can edit or rename anyone else's sign-up or dish.** There is no ownership
  model, because there are no accounts.
- **Nobody can delete.** There is no delete policy, since the app has no delete button.
  You can still delete from the dashboard's Table Editor, which uses the privileged
  service role and bypasses RLS.

If you want to lock it down later, the usual next step is Supabase Auth plus policies
keyed on `auth.uid()` — but that means guests have to sign in, which changes the design.

## Site password gate

A modal asks for the invitation password on a first visit, and remembers the answer in
`localStorage` under `potluck-unlocked` so it only appears once per browser. Clear that
key (or use a private window) to see it again.

**Where the password lives.** Not in the React code, and not in an env var — Vite inlines
env vars into the public bundle, so a password there would be readable by anyone. Instead
the `site_password` table holds only a **bcrypt hash**, RLS is on with **no policies**, and
grants are revoked, so the anon key cannot read it at all. The browser can only call
`verify_site_password(attempt)`, a `security definer` function that answers true or false.
The password and its hash never leave the database.

**Setting or changing it.** Running `schema.sql` does *not* set a password — it creates
the table and function and leaves the table empty, and the gate rejects every attempt
until a row exists. Run this separately in the SQL Editor, and never save it into
`schema.sql`, which is committed:

```sql
delete from public.site_password;
insert into public.site_password (hash)
values (extensions.crypt('YOUR-PASSWORD-HERE', extensions.gen_salt('bf')));
```

If that errors with "schema extensions does not exist", drop both prefixes and use plain
`crypt()` / `gen_salt()`. Then confirm it took:

```sql
select public.verify_site_password('YOUR-PASSWORD-HERE') as should_be_true,
       public.verify_site_password('definitely-wrong')   as should_be_false;
```

### What the gate does and does not protect

It's a doorbell, not a lock. It keeps the pages from rendering for someone who wasn't
invited, which is what a party invite needs. It is **not** access control:

- **The data is still world-readable.** `signups` and `menu_items` allow public `select`,
  so anyone with the anon key from the bundle can query them directly and never see the
  modal at all. The password gates the UI, not the database.
- **The gate is client-side.** Setting `potluck-unlocked` to `true` in devtools skips it.
- **No rate limiting.** Nothing stops repeated `verify_site_password` calls, so a short
  password is brute-forceable. bcrypt makes each attempt slow, not impossible.

If you ever need the *data* protected rather than just the pages, the two real options are
Supabase Auth with policies keyed on `auth.uid()`, or moving reads behind `security
definer` functions that take the password and return rows only when it matches.

## How the React side is wired

- [`src/supabaseClient.js`](src/supabaseClient.js) — the single connection, built on
  first use so a missing key surfaces in the UI rather than as a blank page.
- [`src/signups.js`](src/signups.js) / [`src/menu.js`](src/menu.js) — all the queries.
  These are the only files that talk to Supabase. Each function is async and rejects on
  failure instead of swallowing errors, so pages can show their own error state.
- [`src/useLoad.js`](src/useLoad.js) — runs a loader once on mount and tracks
  loading/error/data. Used by the two list pages. The two form pages run their own
  effect instead, because they seed editable input fields from the result.
- Both forms disable their buttons while saving and stay put on failure with everything
  still typed in.
