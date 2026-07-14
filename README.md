# potluck
Website for hosting a potluck (CS571 web project, jrlivingston).

A **client-side only** React app (React + React Bootstrap + React Router, built with
Vite) hosted on GitHub Pages: **https://wyoskyrjen.github.io/potluck/**

## Local development

```bash
npm install     # first time only
npm run dev      # http://localhost:5173/potluck/
npm run lint     # eslint
```

## Build & deploy (manual)

```bash
npm run build    # outputs the production build into docs/
npm run preview  # optional: serve the built docs/ locally
```

Then commit the updated `docs/` folder and push to `main`. GitHub Pages serves the
site from the `main` branch `/docs` folder (set once in repo Settings → Pages).

See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for full
architecture notes, constraints, and conventions.
