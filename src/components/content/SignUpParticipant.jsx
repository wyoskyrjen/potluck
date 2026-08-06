import { useEffect, useState } from 'react'
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router'

import {
  COMMENT_MAX_LENGTH,
  findSignup,
  loadSignups,
  saveSignup,
} from '../../signups'

// Step two of signing up. One screen serves both cases from the design: if the name
// from step one already exists this is "Update Participant" with the saved details
// filled in, otherwise it is "New Participant" with a blank form.
function SignUpParticipant() {
  const navigate = useNavigate()
  const { name: nameParam } = useParams()

  // The row this name already has, or null for someone new. Set by the effect below.
  const [existing, setExisting] = useState(null)
  const [name, setName] = useState(nameParam ?? '')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [nameError, setNameError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  // Look up the name from step one and, if it is already signed up, seed the form with
  // what we have. This page runs its own effect instead of useLoad because the result
  // becomes editable field state rather than something rendered directly.
  useEffect(() => {
    let active = true

    loadSignups()
      .then((signups) => {
        if (!active) return
        const match = findSignup(signups, nameParam ?? '')
        if (!match) return
        setExisting(match)
        setName(match.name)
        setPhone(match.phone ?? '')
        setComment(match.comment ?? '')
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
  }, [nameParam])

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Name is required.')
      return
    }

    setNameError('')
    setSaveError('')
    setSaving(true)
    try {
      await saveSignup({
        id: existing?.id,
        name: trimmedName,
        phone: phone.trim(),
        comment: comment.trim(),
      })
      navigate('/signup')
    } catch (err) {
      // Stay on the form with everything still typed in so the guest can fix it and
      // try again. No setSaving(false) on the success path -- we navigate away.
      setSaveError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container className="signup-page text-center">
        <Spinner animation="border" aria-hidden="true" />
        <p className="mt-2 mb-0">Looking up {nameParam}…</p>
      </Container>
    )
  }

  // Without knowing whether this name is already signed up, saving could either
  // duplicate the person or silently overwrite details we failed to read.
  if (loadError) {
    return (
      <Container className="signup-page">
        <Alert variant="danger">
          Couldn&apos;t check the sign-up list, so this form isn&apos;t safe to submit
          yet. {loadError.message}
        </Alert>
        <div className="signup-actions signup-form-actions mb-4">
          <Button className="btn-cancel" onClick={() => navigate('/signup')}>
            Back
          </Button>
          {/* A full reload rather than a re-render: the hash route is unchanged, so
              this lands back on this same form and re-runs the lookup. */}
          <Button className="btn-done" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <Container className="signup-page">
      <h2 className="home-heading">
        {existing ? 'Update Participant' : 'New Participant'}
      </h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="mb-3" controlId="participant-name">
          <Form.Label column xs={4} sm={3}>Name:</Form.Label>
          <Col>
            <Form.Control
              className="signup-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="enter name - required"
              isInvalid={Boolean(nameError)}
            />
            <Form.Control.Feedback type="invalid">{nameError}</Form.Control.Feedback>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="participant-phone">
          <Form.Label column xs={4} sm={3}>Phone:</Form.Label>
          <Col>
            <Form.Control
              className="signup-input"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="cell - opt"
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="participant-comment">
          <Form.Label column xs={4} sm={3}>Comment:</Form.Label>
          <Col>
            <Form.Control
              as="textarea"
              rows={5}
              className="signup-input"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="comment for signup page - opt"
              maxLength={COMMENT_MAX_LENGTH}
            />
            <div className="signup-charcount">
              {comment.length}/{COMMENT_MAX_LENGTH}
            </div>
          </Col>
        </Form.Group>

        {saveError && <Alert variant="danger">{saveError}</Alert>}

        <div className="signup-actions signup-form-actions mb-4">
          <Button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/signup')}
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

export default SignUpParticipant
