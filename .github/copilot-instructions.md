# Copilot / AI Assistant Instructions — Potluck

These instructions describe how the **Potluck** project is built and the constraints
any contributor (human or AI) must respect. Read this before generating code.

## What this project is

Potluck is a **pure client-side React application** for the CS571 web project. It is
hosted on **GitHub Pages** at:

> https://wyoskyrjen.github.io/potluck/

## Hard constraints (do not violate)

- **Client-side only.** There is **no backend** and **no server-side rendering**. The
  whole app must run in the browser from static files.
- **No Next.js** (and no other SSR/SSG meta-framework, no server components).
- **Pure React + JavaScript (JSX).** No TypeScript.
- Any data must come from client-side sources: component state, `localStorage`, or a
  public read-only third-party API. Never introduce a server we would have to run.
- Because GitHub Pages only serves static files, **routing must be client-side** — see
  the router note below.

## Stack (exact)

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Build tool     | Vite `^6.3.5` (`@vitejs/plugin-react`)                        |
| UI framework   | React `^19.1.0` + React DOM `^19.1.0`                         |
| Components     | React Bootstrap `^2.10.10` + Bootstrap `^5.3.7`               |
| Routing        | React Router `^7.6.2` — the unified **`react-router`** package |
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
├─ src/
│  ├─ main.jsx                  # entry: imports Bootstrap CSS, mounts <App/>
│  ├─ index.css                 # minimal global styles
│  └─ components/
│     ├─ structural/            # App (router) + Layout (navbar/footer/outlet)
│     └─ content/               # page components: Home, About, NoMatch
├─ index.html
├─ vite.config.js
├─ eslint.config.js
└─ package.json
```

## Commands

```bash
npm install        # install dependencies
npm run dev        # start the Vite dev server (hot reload)
npm run build      # production build into docs/
npm run preview    # serve the built docs/ locally to sanity-check the base path
npm run lint       # eslint
```

## Deploying to GitHub Pages (manual)

1. `npm run build` — regenerates `docs/`.
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
- Keep everything client-side. If a feature seems to need a server, use a client-side
  alternative instead.
