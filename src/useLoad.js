import { useEffect, useState } from 'react'

// Run an async loader once when a component mounts and track the three states a page
// needs from it: still loading, failed, or loaded.
//
// The list pages (Menu, SignUp) use this because they render the result directly. The
// two form pages don't -- they have to seed their input fields from what comes back,
// so they run their own effect and keep that field state themselves.
export function useLoad(loader) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Guards against setting state after the user has navigated away mid-request.
    let active = true

    loader()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err) => {
        if (active) setError(err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
    // `loader` is deliberately not a dependency: one load per mount is the intent, and
    // callers pass a plain function reference that never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, error, loading }
}
