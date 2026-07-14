import { Card, Col, Row } from 'react-bootstrap'

function About() {
  return (
    <Row>
      <Col md={8}>
        <h1>About Potluck</h1>
        <p>
          Potluck is a small demonstration app for the CS571 web project. It is a
          pure client-side React application — there is no backend and no
          server-side rendering — so it can be served as static files directly
          from GitHub Pages.
        </p>
        <Card body className="bg-light">
          <strong>Built with:</strong> React 19, React Bootstrap 5, and React
          Router 7 (declarative mode). Bundled by Vite and deployed by pushing the
          built <code>docs/</code> folder.
        </Card>
      </Col>
    </Row>
  )
}

export default About
