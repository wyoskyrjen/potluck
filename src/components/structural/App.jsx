import { HashRouter, Route, Routes } from 'react-router'

import Layout from './Layout'
import Home from '../content/Home'
import About from '../content/About'
import NoMatch from '../content/NoMatch'

// Declarative React Router (v7). HashRouter is used because GitHub Pages serves
// static files only — hash-based routes (e.g. /potluck/#/about) resolve entirely
// on the client, so refreshing or deep-linking never hits a server 404.
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
