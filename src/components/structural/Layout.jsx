import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link, Outlet } from 'react-router'

// Shared chrome for every page: a React Bootstrap navbar wired to React Router
// links, and an <Outlet /> where the matched child route renders.
function Layout() {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="md" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/">🥘 Potluck</Navbar.Brand>
          <Navbar.Toggle aria-controls="potluck-nav" />
          <Navbar.Collapse id="potluck-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/about">About</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main>
        <Container className="py-4">
          <Outlet />
        </Container>
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
