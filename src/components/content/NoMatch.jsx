import { Button } from 'react-bootstrap'
import { Link } from 'react-router'

function NoMatch() {
  return (
    <div className="text-center py-5">
      <h1 className="display-4">404</h1>
      <p className="text-muted">That page isn't on the menu.</p>
      <Button as={Link} to="/" variant="primary">
        Back to the potluck
      </Button>
    </div>
  )
}

export default NoMatch
