import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link, Outlet } from 'react-router'

import PasswordGate from './PasswordGate'

// Shared chrome for every page: a React Bootstrap navbar wired to React Router
// links, and an <Outlet /> where the matched child route renders.
function Layout() {
  return (
    <>
      <Navbar variant="light" sticky="top" className="navbar-potluck">
        {/* Decorative watermelon tucked into the bottom-left corner. It lives outside
            the Container so it can sit flush with the viewport edge rather than the
            Container's centered gutter, and it's a CSS background (not an <img>) so
            screen readers skip it. */}
        <span className="navbar-watermelon" />
        <Container>
          <Navbar.Brand as={Link} to="/">Jenna's Summer 2026 Potluck</Navbar.Brand>
        </Container>
      </Navbar>

      {/* No Container here on purpose: pages own their own width, so Home's
          colored bands can run edge to edge across the viewport. */}
      <main>
        {/* The gate wraps the Outlet rather than the whole Layout so the navbar and
            footer still frame the password prompt — a guest can see whose potluck they
            are being asked about. It sits here rather than inside Home because a hash
            link straight to /#/menu would otherwise walk right past it. */}
        <PasswordGate>
          <Outlet />
        </PasswordGate>
      </main>

      <footer className="bg-light border-top py-3">
        <Container className="text-center text-muted small">
          Potluck · a client-side React app hosted on GitHub Pages
        </Container>
      </footer>
    </>
  )
}

export default Layout
