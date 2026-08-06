import { useState } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap'

import { isUnlocked, rememberUnlocked, verifyPassword } from '../../sitePassword'

// Asks for the invitation password on a first visit, and remembers the answer so it
// only ever appears once per browser.
//
// The children aren't rendered until it unlocks, so the pages behind the modal never
// mount and never query the database. The modal can't be dismissed -- no close button,
// a static backdrop, and Escape disabled -- since there is nothing behind it to see.
function PasswordGate({ children }) {
  // Read once on mount: a browser that has already been let in never sees the modal.
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const [attempt, setAttempt] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!attempt) {
      setError('Please enter the password.')
      return
    }

    setError('')
    setChecking(true)
    try {
      if (await verifyPassword(attempt)) {
        rememberUnlocked()
        // The children render from here, so `checking` never needs resetting.
        setUnlocked(true)
        return
      }
      setError("That password isn't right — check your invitation and try again.")
      setAttempt('')
    } catch {
      // A network or configuration fault, not a wrong password. Deliberately vague
      // about the cause but clear that retrying is the right move.
      setError("Couldn't check the password just now. Check your connection, then try again.")
    }
    setChecking(false)
  }

  if (unlocked) return children

  return (
    // autoFocus={false} refers to the dialog, not the field: left on, the Modal takes
    // focus for itself once the transition ends and undoes the input's autoFocus below.
    // Tab is still trapped inside the dialog either way.
    <Modal
      show
      centered
      backdrop="static"
      keyboard={false}
      autoFocus={false}
      className="menu-modal"
    >
      <Modal.Header>
        <Modal.Title className="home-heading mb-0">You&apos;re invited!</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p>Enter the password from your invitation to see the potluck details.</p>

          <Form.Group controlId="site-password">
            <Form.Label className="visually-hidden">Password</Form.Label>
            <Form.Control
              type="password"
              className="signup-input"
              value={attempt}
              onChange={(event) => setAttempt(event.target.value)}
              placeholder="password"
              autoComplete="current-password"
              autoFocus
              disabled={checking}
            />
          </Form.Group>

          {error && (
            <Alert variant="danger" className="mt-3 mb-0">
              {error}
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" className="btn-done" disabled={checking}>
            {checking ? 'Checking…' : 'Enter'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default PasswordGate
