import { useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router'

// Step one of signing up: ask who this is. The name is carried in the URL to the
// participant screen, which decides on its own whether that is a new person or
// an existing one to update.
function SignUpName() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Please enter a name.')
      return
    }
    navigate(`/signup/participant/${encodeURIComponent(trimmedName)}`)
  }

  return (
    <Container className="signup-page">
      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="mb-4" controlId="lookup-name">
          <Form.Label column xs={4} sm={3}>Name:</Form.Label>
          <Col>
            <Form.Control
              className="signup-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="enter name"
              isInvalid={Boolean(error)}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
          </Col>
        </Form.Group>

        <div className="signup-actions signup-form-actions">
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

export default SignUpName
