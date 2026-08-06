import { useEffect, useState } from 'react'
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router'

import {
  DIETS,
  formatIngredients,
  loadItem,
  parseIngredients,
  saveItem,
} from '../../menu'
import { loadSignups } from '../../signups'

// Add or edit one dish. One screen serves both: /menu/item/new opens blank, while the
// pencil on a menu card lands on /menu/item/:id with that dish filled in.
function MenuItem() {
  const navigate = useNavigate()
  const { id } = useParams()

  // The dish being edited, or null when adding. Set by the effect below.
  const [existing, setExisting] = useState(null)
  const [signups, setSignups] = useState([])
  const [name, setName] = useState('')
  const [bringer, setBringer] = useState('')
  const [diets, setDiets] = useState([])
  const [ingredients, setIngredients] = useState('')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [nameError, setNameError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  // The dish (when editing) and the sign-up names for the Bringing list. Both are
  // needed before the form can render, so they go out together rather than in series.
  // This page runs its own effect instead of useLoad because the dish becomes editable
  // field state rather than something rendered directly.
  useEffect(() => {
    let active = true

    Promise.all([id ? loadItem(id) : null, loadSignups()])
      .then(([item, people]) => {
        if (!active) return
        setSignups(people)
        if (!item) return
        setExisting(item)
        setName(item.name)
        setBringer(item.bringer ?? '')
        setDiets(item.diets ?? [])
        setIngredients(formatIngredients(item.ingredients))
      })
      .catch((err) => {
        if (active) setLoadError(err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  function toggleDiet(dietId) {
    setDiets((current) =>
      current.includes(dietId)
        ? current.filter((each) => each !== dietId)
        : [...current, dietId]
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Item name is required.')
      return
    }

    setNameError('')
    setSaveError('')
    setSaving(true)
    try {
      await saveItem({
        id: existing?.id,
        name: trimmedName,
        bringer: bringer.trim(),
        diets,
        ingredients: parseIngredients(ingredients),
      })
      navigate('/menu')
    } catch (err) {
      // Stay on the form with everything still typed in so it can be fixed and tried
      // again. No setSaving(false) on the success path -- we navigate away.
      setSaveError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container className="signup-page text-center">
        <Spinner animation="border" aria-hidden="true" />
        <p className="mt-2 mb-0">{id ? 'Loading the dish…' : 'Getting set up…'}</p>
      </Container>
    )
  }

  if (loadError) {
    return (
      <Container className="signup-page">
        <Alert variant="danger">
          Couldn&apos;t load this form. {loadError.message}
        </Alert>
        <div className="signup-actions signup-form-actions mb-4">
          <Button className="btn-cancel" onClick={() => navigate('/menu')}>
            Back to the menu
          </Button>
          {/* A full reload rather than a re-render: the hash route is unchanged, so
              this lands back on this same form and re-runs the load. */}
          <Button className="btn-done" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </Container>
    )
  }

  // A pencil link only ever points at a real id, so getting here means a stale
  // bookmark, a hand-edited URL, or a dish someone removed from the dashboard.
  if (id && !existing) {
    return (
      <Container className="signup-page">
        <p>That item is no longer on the menu.</p>
        <Link to="/menu">Back to the menu</Link>
      </Container>
    )
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
              isInvalid={Boolean(nameError)}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">{nameError}</Form.Control.Feedback>
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

        {saveError && <Alert variant="danger">{saveError}</Alert>}

        <div className="signup-actions signup-form-actions mb-4">
          <Button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/menu')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" className="btn-done" disabled={saving}>
            {saving ? 'Saving…' : 'Done'}
          </Button>
        </div>
      </Form>
    </Container>
  )
}

export default MenuItem
