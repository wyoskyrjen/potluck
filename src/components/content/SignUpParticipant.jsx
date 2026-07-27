import { useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router'

import {
  COMMENT_MAX_LENGTH,
  findSignup,
  loadSignups,
  saveSignups,
  upsertSignup,
} from '../../signups'

// Step two of signing up. One screen serves both cases from the design: if the
// name from step one already exists this is "Update Participant" with the saved
// details filled in, otherwise it is "New Participant" with a blank form.
function SignUpParticipant() {
  const navigate = useNavigate()
  const { name: nameParam } = useParams()

  // Read once on mount so typing never fights with what is in storage.
  const [existing] = useState(() => findSignup(loadSignups(), nameParam ?? ''))
  const [name, setName] = useState(existing?.name ?? nameParam ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Name is required.')
      return
    }
    // Re-read here rather than reusing the mount-time copy: another tab may have
    // signed someone up while this form was open.
    saveSignups(
      upsertSignup(loadSignups(), {
        name: trimmedName,
        phone: phone.trim(),
        comment: comment.trim(),
      })
    )
    navigate('/signup')
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
              isInvalid={Boolean(error)}
            />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
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

        <div className="signup-actions signup-form-actions mb-4">
          <Button type="button" className="btn-cancel" onClick={() => navigate('/signup')}>
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

export default SignUpParticipant
