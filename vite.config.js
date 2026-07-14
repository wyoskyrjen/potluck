import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` matches the GitHub Pages project path: https://wyoskyrjen.github.io/potluck/
// `build.outDir: 'docs'` writes the production build into a committed docs/ folder so
// the app can be deployed manually via `npm run build` + push (Pages source = main /docs).
export default defineConfig({
  plugins: [react()],
  base: '/potluck/',
  build: {
    outDir: 'docs',
  },
})
