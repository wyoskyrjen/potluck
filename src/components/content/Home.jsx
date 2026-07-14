import { Button, Card, Col, Row } from 'react-bootstrap'

// Dummy potluck sign-up data. In a real client-side app this could come from
// component state, localStorage, or a public read-only API — never a server we own.
const DISHES = [
  { id: 1, dish: 'Garden Salad', who: 'Alex', category: 'Side' },
  { id: 2, dish: 'BBQ Pulled Jackfruit', who: 'Sam', category: 'Main' },
  { id: 3, dish: 'Cheddar Biscuits', who: 'Jordan', category: 'Bread' },
  { id: 4, dish: 'Apple Pie', who: 'Casey', category: 'Dessert' },
]

function Home() {
  return (
    <>
      <Row className="mb-4">
        <Col>
          <h1>Who's bringing what?</h1>
          <p className="text-muted">
            A demo potluck sign-up board built with React, React Bootstrap, and
            React Router — 100% client-side.
          </p>
        </Col>
      </Row>

      <Row xs={1} sm={2} lg={4} className="g-3">
        {DISHES.map((item) => (
          <Col key={item.id}>
            <Card className="h-100">
              <Card.Body>
                <Card.Subtitle className="text-uppercase text-muted small mb-2">
                  {item.category}
                </Card.Subtitle>
                <Card.Title>{item.dish}</Card.Title>
                <Card.Text className="text-muted">Brought by {item.who}</Card.Text>
                <Button variant="outline-primary" size="sm">
                  Claim a slot
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default Home
