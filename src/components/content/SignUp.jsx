import { Alert, Button, Container, Spinner } from 'react-bootstrap'
import { Link } from 'react-router'

import { loadSignups } from '../../signups'
import { useLoad } from '../../useLoad'

function SignUp() {
  // Fetched fresh on mount. Returning here after Done remounts the route, so the list
  // always reflects the latest save -- including sign-ups made on someone else's phone.
  const { data, loading, error } = useLoad(loadSignups)
  const signups = data ?? []

  return (
    <Container className="signup-page">
      <div className="signup-actions">
        <Button as={Link} to="/signup/who" className="btn-potluck" size="lg">
          Sign Up!
        </Button>
      </div>

      <h2 className="home-heading mt-4">Signed Up</h2>
      <div className="signup-list">
        {loading && (
          <p className="mb-0 text-center">
            <Spinner animation="border" size="sm" aria-hidden="true" /> Loading
            sign-ups…
          </p>
        )}

        {error && (
          <Alert variant="danger" className="mb-0">
            Couldn&apos;t load the sign-ups. {error.message}
          </Alert>
        )}

        {!loading && !error && signups.length === 0 && (
          <p className="mb-0 text-center">No one has signed up yet — be the first!</p>
        )}

        {!loading && !error && signups.length > 0 && (
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
