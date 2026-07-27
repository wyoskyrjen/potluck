import { useState } from 'react'
import { Button, Container } from 'react-bootstrap'
import { Link } from 'react-router'

import { loadSignups } from '../../signups'

function SignUp() {
  // Read once when the page mounts. Returning here after Done remounts the route,
  // so the list always reflects the latest save.
  const [signups] = useState(loadSignups)

  return (
    <Container className="signup-page">
      <div className="signup-actions">
        <Button as={Link} to="/signup/who" className="btn-potluck" size="lg">
          Sign Up!
        </Button>
      </div>

      <h2 className="home-heading mt-4">Signed Up</h2>
      <div className="signup-list">
        {signups.length === 0 ? (
          <p className="mb-0 text-center">No one has signed up yet — be the first!</p>
        ) : (
          <ul className="signup-entries">
            {signups.map((signup) => (
              <li key={signup.id} className="signup-entry">
                {signup.name}
                {signup.comment && ` - ${signup.comment}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="signup-actions mt-4 mb-4">
        <Button as={Link} to="/" className="btn-cancel" size="lg">
          Cancel
        </Button>
      </div>
    </Container>
  )
}

export default SignUp
