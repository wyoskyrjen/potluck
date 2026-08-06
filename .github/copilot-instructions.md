# Copilot / AI Assistant Instructions — Potluck

These instructions describe how the **Potluck** project is built and the constraints
any contributor (human or AI) must respect. Read this before generating code.

## What this project is

Potluck is a **static client-side React application** for the CS571 web project. It is
hosted on **GitHub Pages** at:

> https://wyoskyrjen.github.io/potluck/

Persistent data (sign-ups and menu items) lives in **Supabase**, a hosted
Postgres-plus-REST service the browser calls directly. See
[`README-supabase.md`](../README-supabase.md) for setup, schema, and the security
trade-offs of the Row Level Security policies.

## Hard constraints (do not violate)

- **Static front end, no server of our own.** No server-side rendering and nothing we
  have to run or deploy ourselves — the whole app must load from static files on GitHub
  Pages. Supabase is fine because it is a hosted API the browser talks to; standing up
  our own Express/Node/etc. backend is not.
- **No Next.js** (and no other SSR/SSG meta-framework, no server components).
- **Pure React + JavaScript (JSX).** No TypeScript.
- **All Supabase access goes through [`src/signups.js`](../src/signups.js) and
  [`src/menu.js`](../src/menu.js).** Components never build queries themselves, and
  nothing but [`src/supabaseClient.js`](../src/supabaseClient.js) constructs the client.
- **Only the anon key ever reaches client code.** The `service_role` key bypasses Row
  Level Security and must never appear in this repo or in a build.
- **No secrets in env vars.** `VITE_*` values are inlined into the public bundle, so they
  are not a hiding place. Anything that must stay private (e.g. the invitation password)
  belongs in a table the anon key cannot read, reached through a `security definer`
  function — see the password gate in `supabase/schema.sql`.
- Because GitHub Pages only serves static files, **routing must be client-side** — see
  the router note below.

## Stack (exact)

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Build tool     | Vite `^6.3.5` (`@vitejs/plugin-react`)                        |
| UI framework   | React `^19.1.0` + React DOM `^19.1.0`                         |
| Components     | React Bootstrap `^2.10.10` + Bootstrap `^5.3.7`               |
| Routing        | React Router `^7.6.2` — the unified **`react-router`** package |
| Data           | Supabase (`@supabase/supabase-js` `^2`)                       |
| Package manager| npm (`package-lock.json`)                                     |
| Language       | JavaScript / JSX (no TypeScript)                             |

## Routing — React Router declarative mode + HashRouter

- Use React Router in **declarative mode**: `<HashRouter>`, `<Routes>`, `<Route>`,
  `<Link>`, `<Outlet>`. Do **not** use the data-router API (`createBrowserRouter`,
  loaders/actions) or the framework mode.
- Import from **`react-router`**, not `react-router-dom` (v7 unified the package).
- We use **`HashRouter`** (not `BrowserRouter`) on purpose: GitHub Pages cannot do
  server-side SPA fallback, so clean-path routing would 404 on refresh/deep-link.
  Hash routes (e.g. `/potluck/#/about`) resolve entirely in the browser.

The route tree lives in [`src/components/structural/App.jsx`](../src/components/structural/App.jsx):
a layout route wrapping an `index` route, an `about` route, and a `path="*"` no-match.

## Vite configuration ([`vite.config.js`](../vite.config.js))

- **`base: '/potluck/'`** — required so asset URLs resolve under the project-pages path.
  If the repo is ever renamed, update this to `/<new-repo-name>/`.
- **`build.outDir: 'docs'`** — the production build is written to `docs/` so it can be
  committed and served by GitHub Pages directly (no separate branch, no CI).

## Project structure

```
potluck/
├─ .github/
│  └─ copilot-instructions.md   # this file
├─ docs/                        # production build output (committed; served by Pages)
├─ public/                      # static assets copied verbatim
├─ supabase/
│  └─ schema.sql                # tables + RLS policies; paste into the SQL Editor
├─ src/
│  ├─ main.jsx                  # entry: imports Bootstrap CSS, mounts <App/>
│  ├─ index.css                 # minimal global styles
│  ├─ supabaseClient.js         # the one Supabase connection
│  ├─ signups.js                # all `signups` queries + participant helpers
│  ├─ menu.js                   # all `menu_items` queries + DIETS/ingredient helpers
│  ├─ sitePassword.js           # invitation-password check (RPC) + unlock persistence
│  ├─ useLoad.js                # load-once-on-mount hook (loading/error/data)
│  └─ components/
│     ├─ structural/            # App (router), Layout (chrome), PasswordGate
│     └─ content/               # page components: Home, About, NoMatch
├─ .env.example                 # copy to .env.local and fill in the anon key
├─ index.html
├─ vite.config.js
├─ eslint.config.js
└─ package.json
```

## Commands

```bash
npm install        # install dependencies
                   # then: copy .env.example to .env.local and add the Supabase anon key
npm run dev        # start the Vite dev server (hot reload)
npm run build      # production build into docs/
npm run preview    # serve the built docs/ locally to sanity-check the base path
npm run lint       # eslint
```

## Deploying to GitHub Pages (manual)

1. `npm run build` — regenerates `docs/`. Vite inlines the `VITE_SUPABASE_*` values into
   the bundle at this point, so `.env.local` must exist on the machine doing the build.
2. Commit the updated `docs/` folder (it is intentionally **not** gitignored).
3. `git push` to `main`.
4. **One-time setup:** in the GitHub repo → Settings → Pages, set the source to
   **Deploy from a branch**, branch **`main`**, folder **`/docs`**.

The live site updates a minute or two after the push.

## Conventions for new code

- New pages go in `src/components/content/`; shared chrome in `src/components/structural/`.
- Add a route in `App.jsx` and a `<Nav.Link as={Link} to="...">` in `Layout.jsx`.
- Prefer React Bootstrap components (`Container`, `Row`, `Col`, `Card`, `Button`, `Nav`,
  `Navbar`, …) over hand-rolled markup + custom CSS.
- Keep the front end static. If a feature seems to need a server of our own, use
  Supabase or a client-side alternative instead.
- Anything that fetches must handle all three states — loading, failed, loaded. Use
  `useLoad` for pages that render data directly; forms that pre-fill inputs from a query
  run their own effect and gate rendering on it.
- New tables or policies go in `supabase/schema.sql`, which must stay re-runnable
  (`create … if not exists`, `drop policy if exists` before `create policy`).
