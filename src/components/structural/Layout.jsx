import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link, Outlet } from 'react-router'

// Shared chrome for every page: a React Bootstrap navbar wired to React Router
// links, and an <Outlet /> where the matched child route renders.
function Layout() {
  return (
    <>
      <Navbar variant="light" sticky="top" className="navbar-potluck">
        <Container>
          <Navbar.Brand as={Link} to="/">Jenna's Summer 2026 Potluck</Navbar.Brand>
        </Container>
      </Navbar>

      {/* No Container here on purpose: pages own their own width, so Home's
          colored bands can run edge to edge across the viewport. */}
      <main>
        <Outlet />
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
