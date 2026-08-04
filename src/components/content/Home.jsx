import { useEffect, useState } from 'react'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import hostPhoto from '../../../assets/exampleHostImage.jpg'

// When the potluck starts. Everything on this page (including the countdown) is
// derived from this one constant, so moving the party means editing one line.
const EVENT_START = new Date('2026-08-15T17:00:00')

const EVENT_WHEN = 'Saturday, August 15, 2026 5:00 – 9:00 PM'
const EVENT_WHERE = '1210 W Dayton St, Madison, WI 53706'
const EVENT_MAP = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT_WHERE)}`

// Approximate coordinates for EVENT_WHERE, used to center the embedded map. If the
// venue moves, right-click the spot in any map app, copy the lat/long, and edit here.
const EVENT_COORDS = { lat: 43.0717, lon: -89.4065 }

// OpenStreetMap's embed endpoint takes a bounding box rather than a zoom level; a
// small box around the venue lands on a street-level view. It needs no API key and
// no third-party script, so the page stays purely static.
const MAP_SPAN = { lat: 0.002, lon: 0.004 }
const MAP_BBOX = [
  EVENT_COORDS.lon - MAP_SPAN.lon,
  EVENT_COORDS.lat - MAP_SPAN.lat,
  EVENT_COORDS.lon + MAP_SPAN.lon,
  EVENT_COORDS.lat + MAP_SPAN.lat,
]
  .map((n) => n.toFixed(4))
  .join(',')
const MAP_EMBED =
  `https://www.openstreetmap.org/export/embed.html?bbox=${MAP_BBOX}` +
  `&layer=mapnik&marker=${EVENT_COORDS.lat},${EVENT_COORDS.lon}`

// Whole days + leftover hours + leftover minutes until the event, or null once it
// has started. Minutes matter: without them the line floors to a bare "0 hours" for
// the whole hour before the party, which reads as a broken countdown.
function getRemaining() {
  const ms = EVENT_START.getTime() - Date.now()
  if (ms <= 0) return null
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
  }
}

const plural = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'}`

function Home() {
  const [remaining, setRemaining] = useState(getRemaining)

  // Minutes are the smallest unit shown, so a once-a-minute tick is plenty.
  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemaining()), 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="potluck-home">
      <section className="home-band home-band-green">
        <Container fluid>
          <h2 className="home-heading">Event Info</h2>
          <Card className="home-card text-center">
            <Card.Body>
              <p className="mb-1"><strong>When:</strong> {EVENT_WHEN}</p>
              <p className="mb-1"><strong>Where:</strong> {EVENT_WHERE}</p>
              <div className="home-map">
                <iframe
                  title={`Map showing ${EVENT_WHERE}`}
                  src={MAP_EMBED}
                  loading="lazy"
                />
              </div>
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
        <Container fluid>
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
        <Container fluid>
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
        <Container fluid className="text-center">
          {remaining
            ? `Countdown: ${plural(remaining.days, 'day')}, ` +
              `${plural(remaining.hours, 'hour')}, ` +
              `${plural(remaining.minutes, 'minute')}`
            : 'The potluck is happening right now — come on over!'}
        </Container>
      </section>
    </div>
  )
}

export default Home
