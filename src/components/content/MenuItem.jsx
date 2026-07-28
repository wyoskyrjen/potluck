import { useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router'

import {
  DIETS,
  findItem,
  formatIngredients,
  loadMenu,
  parseIngredients,
  saveMenu,
  upsertItem,
} from '../../menu'
import { loadSignups } from '../../signups'

// Add or edit one dish. One screen serves both: /menu/item/new opens blank, while
// the pencil on a menu card lands on /menu/item/:id with that dish filled in.
function MenuItem() {
  const navigate = useNavigate()
  const { id } = useParams()

  // Read once on mount so typing never fights with what is in storage.
  const [existing] = useState(() => (id ? findItem(loadMenu(), id) : null))
  const [signups] = useState(loadSignups)
  const [name, setName] = useState(existing?.name ?? '')
  const [bringer, setBringer] = useState(existing?.bringer ?? '')
  const [diets, setDiets] = useState(existing?.diets ?? [])
  const [ingredients, setIngredients] = useState(
    formatIngredients(existing?.ingredients)
  )
  const [error, setError] = useState('')

  // A pencil link only ever points at a real id, so getting here means a stale
  // bookmark or a hand-edited URL.
  if (id && !existing) {
    return (
      <Container className="signup-page">
        <p>That item is no longer on the menu.</p>
        <Link to="/menu">Back to the menu</Link>
      </Container>
    )
  }

  function toggleDiet(dietId) {
    setDiets((current) =>
      current.includes(dietId)
        ? current.filter((each) => each !== dietId)
        : [...current, dietId]
    )
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Item name is required.')
      return
    }
    // Re-read here rather than reusing the mount-time copy: another tab may have
    // changed the menu while this form was open.
    saveMenu(
      upsertItem(loadMenu(), {
        id: existing?.id,
        name: trimmedName,
        bringer: bringer.trim(),
        diets,
        ingredients: parseIngredients(ingredients),
      })
    )
    navigate('/menu')
  }

  return (
    <Container className="signup-page">
      <h2 className="home-heading">{existing ? 'Update Item' : 'New Item'}</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="mb-3" controlId="item-name">
          <Form.Label column xs={4} sm={3}>Item:</Form.Label>
          <Col>
            <Form.Control
              className="signup-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="dish name - required"
              isInvalid={Boolean(error)}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* A datalist rather than a select: anyone already signed up can be picked
            from the list, but a guest who hasn't signed up can still be typed in. */}
        <Form.Group as={Row} className="mb-3" controlId="item-bringer">
          <Form.Label column xs={4} sm={3}>Bringing:</Form.Label>
          <Col>
            <Form.Control
              className="signup-input"
              list="signup-names"
              value={bringer}
              onChange={(event) => setBringer(event.target.value)}
              placeholder="who's bringing it - opt"
            />
            <datalist id="signup-names">
              {signups.map((signup) => (
                <option key={signup.id} value={signup.name} />
              ))}
            </datalist>
          </Col>
        </Form.Group>

        <fieldset className="mb-3">
          <Row>
            <Col xs={4} sm={3}>
              <legend className="col-form-label pt-0">Diet:</legend>
            </Col>
            <Col>
              {DIETS.map((diet) => (
                <Form.Check
                  key={diet.id}
                  type="checkbox"
                  id={`diet-${diet.id}`}
                  label={diet.label}
                  checked={diets.includes(diet.id)}
                  onChange={() => toggleDiet(diet.id)}
                />
              ))}
            </Col>
          </Row>
        </fieldset>

        <Form.Group as={Row} className="mb-3" controlId="item-ingredients">
          <Form.Label column xs={4} sm={3}>Ingredients:</Form.Label>
          <Col>
            <Form.Control
              as="textarea"
              rows={5}
              className="signup-input"
              value={ingredients}
              onChange={(event) => setIngredients(event.target.value)}
              placeholder={'one ingredient per line - opt'}
            />
            <Form.Text>
              One per line. These show up in the Ingredients pop-up on the menu.
            </Form.Text>
          </Col>
        </Form.Group>

        <div className="signup-actions signup-form-actions mb-4">
          <Button type="button" className="btn-cancel" onClick={() => navigate('/menu')}>
            Cancel
          </Button>
          <Button type="submit" className="btn-done">
            Done
          </Button>
        </div>
      </Form>
    </Container>
  )
}

export default MenuItem
