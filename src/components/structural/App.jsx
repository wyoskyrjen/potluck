import { HashRouter, Route, Routes } from 'react-router'

import Layout from './Layout'
import Home from '../content/Home'
import SignUp from '../content/SignUp'
import SignUpName from '../content/SignUpName'
import SignUpParticipant from '../content/SignUpParticipant'
import Menu from '../content/Menu'
import MenuItem from '../content/MenuItem'
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
          <Route path="signup" element={<SignUp />} />
          <Route path="signup/who" element={<SignUpName />} />
          <Route path="signup/participant/:name" element={<SignUpParticipant />} />
          <Route path="menu" element={<Menu />} />
          {/* Same form either way: no id means a new dish, an id means edit it. */}
          <Route path="menu/item/new" element={<MenuItem />} />
          <Route path="menu/item/:id" element={<MenuItem />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
