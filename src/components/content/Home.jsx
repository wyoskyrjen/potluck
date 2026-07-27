import { useEffect, useState } from 'react'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import hostPhoto from '../../../assets/Hi There.png'

// Dummy potluck sign-up data. In a real client-side app this could come from
// component state, localStorage, or a public read-only API — never a server we own.
const DISHES = [
  { id: 1, dish: 'Garden Salad', who: 'Alex', category: 'Side' },
  { id: 2, dish: 'BBQ Pulled Jackfruit', who: 'Sam', category: 'Main' },
  { id: 3, dish: 'Cheddar Biscuits', who: 'Jordan', category: 'Bread' },
  { id: 4, dish: 'Apple Pie', who: 'Casey', category: 'Dessert' },
]

// When the potluck starts. Everything on this page (including the countdown) is
// derived from this one constant, so moving the party means editing one line.
const EVENT_START = new Date('2026-08-15T17:00:00')

const EVENT_WHEN = 'Saturday, August 15, 2026 · 5:00 – 9:00 PM'
const EVENT_WHERE = '1210 W Dayton St, Madison, WI 53706'
const EVENT_MAP = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT_WHERE)}`

// Whole days + leftover whole hours until the event, or null once it has started.
function getRemaining() {
  const ms = EVENT_START.getTime() - Date.now()
  if (ms <= 0) return null
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
  }
}

function Home() {
  const [remaining, setRemaining] = useState(getRemaining)

  // Hours are the smallest unit shown, so a once-a-minute tick is plenty.
  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemaining()), 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="potluck-home">
      <section className="home-band home-band-green">
        <Container>
          <h2 className="home-heading">Event Info</h2>
          <Card className="home-card text-center">
            <Card.Body>
              <p className="mb-1"><strong>When:</strong> {EVENT_WHEN}</p>
              <p className="mb-1"><strong>Where:</strong> {EVENT_WHERE}</p>
              <p className="mb-0">
                <a href={EVENT_MAP} target="_blank" rel="noreferrer">Open in Maps</a>
                {' · '}
                Free street parking on Dayton; the lot behind the building is open after 4 PM.
              </p>
            </Card.Body>
          </Card>
        </Container>
      </section>

      <section className="home-band home-band-white">
        <Container>
          <div className="home-actions">
            <Button as={Link} to="/signup" className="btn-potluck" size="lg">
              Sign Up!
            </Button>
            <Button as={Link} to="/menu" className="btn-potluck" size="lg">
              Menu
            </Button>
          </div>
        </Container>
      </section>

      <section className="home-band home-band-green">
        <Container>
          <h2 className="home-heading">About the Host</h2>
          <Row className="g-3">
            <Col xs={5}>
              <Card className="home-card h-100">
                <Card.Img
                  variant="top"
                  src={hostPhoto}
                  alt="Jenna, your potluck host"
                  className="home-host-photo"
                />
              </Card>
            </Col>
            <Col xs={7}>
              <Card className="home-card h-100 text-center">
                <Card.Body>
                  <p className="mb-2">
                    Hi, I&apos;m Jenna! I host a potluck every summer — bring a dish,
                    bring a friend, and I&apos;ll handle the grill and the lemonade.
                  </p>
                  <p className="mb-0">
                    <a href="tel:+16085550123">(608) 555-0123</a>
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="home-countdown">
        <Container className="text-center">
          {remaining
            ? `Countdown: ${remaining.days} days, ${remaining.hours} hours`
            : 'The potluck is happening right now — come on over!'}
        </Container>
      </section>
    </div>
  )
}

export default Home
