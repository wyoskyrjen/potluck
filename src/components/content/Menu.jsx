import { useState } from 'react'
import { Button, Card, Col, Container, Modal, Row } from 'react-bootstrap'
import { Link } from 'react-router'

import { DIETS, dietsFor, loadMenu } from '../../menu'

// The abbreviation badges on a card. Each carries its full label as a tooltip and
// as screen-reader text, so the legend band is a convenience rather than the only
// way to decode them.
function DietBadges({ diets }) {
  const matched = dietsFor(diets)
  if (matched.length === 0) return null

  return (
    <div className="menu-diets">
      {matched.map((diet) => (
        <span
          key={diet.id}
          className={`menu-diet menu-diet-${diet.id}`}
          title={diet.label}
        >
          <span aria-hidden="true">{diet.abbr}</span>
          <span className="visually-hidden">{diet.label}</span>
        </span>
      ))}
    </div>
  )
}

function Menu() {
  // Read once when the page mounts. Returning here after Done remounts the route,
  // so the grid always reflects the latest save.
  const [items] = useState(loadMenu)

  // The item whose ingredients are showing, or null when the modal is closed.
  const [openItem, setOpenItem] = useState(null)

  return (
    <div className="menu-page">
      <Container>
        <h2 className="home-heading">Menu</h2>

        <Row xs={2} className="g-3">
          <Col>
            <Button as={Link} to="/menu/item/new" className="btn-add-item">
              + Add Item
            </Button>
          </Col>

          {items.map((item) => (
            <Col key={item.id}>
              <Card className="menu-card h-100">
                <Card.Body>
                  <Link
                    to={`/menu/item/${item.id}`}
                    className="menu-edit"
                    aria-label={`Edit ${item.name}`}
                  >
                    <span aria-hidden="true">&#9998;</span>
                  </Link>
                  <p className="menu-card-title">{item.name}</p>
                  {item.bringer && (
                    <p className="menu-card-bringer">&mdash; {item.bringer}</p>
                  )}
                  <DietBadges diets={item.diets} />
                  <Button
                    variant="link"
                    className="menu-ingredients-link"
                    onClick={() => setOpenItem(item)}
                  >
                    Ingredients
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {items.length === 0 && (
          <p className="text-center mt-3 mb-0">
            Nothing on the menu yet &mdash; add the first dish!
          </p>
        )}
      </Container>

      <section className="menu-legend">
        <Container>
          <p className="menu-legend-heading">Icon reference</p>
          <ul className="menu-legend-items">
            {DIETS.map((diet) => (
              <li key={diet.id} className="menu-legend-item">
                <span
                  className={`menu-diet menu-diet-${diet.id}`}
                  aria-hidden="true"
                >
                  {diet.abbr}
                </span>
                {diet.label}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* One modal for the whole grid: clicking Ingredients on a card sets which
          item it describes. */}
      <Modal
        show={Boolean(openItem)}
        onHide={() => setOpenItem(null)}
        centered
        className="menu-modal"
      >
        <Modal.Header>
          <Modal.Title className="menu-card-title mb-0">
            {openItem?.name}
          </Modal.Title>
          <button
            type="button"
            className="menu-modal-close"
            onClick={() => setOpenItem(null)}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </Modal.Header>
        <Modal.Body>
          <p className="menu-modal-subheading">Ingredients</p>
          {openItem?.ingredients?.length ? (
            <ul className="mb-0">
              {openItem.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          ) : (
            <p className="mb-0">No ingredients listed yet.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default Menu
