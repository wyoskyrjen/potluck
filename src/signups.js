// Sign-up storage for the potluck. Everything lives in localStorage — there is no
// backend — and every screen in the sign-up flow reads and writes through here so
// the shape of a participant is defined in exactly one place.
//
// A participant: { id, name, phone, comment }

const STORAGE_KEY = 'potluck-signups'

export function loadSignups() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Private browsing or a corrupted value — start empty instead of crashing.
    return []
  }
}

export function saveSignups(signups) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(signups))
  } catch {
    // Storage blocked or full; the change still applies for this visit.
  }
}

// Names are matched case- and whitespace-insensitively, so "jenna " updates the
// existing "Jenna" rather than adding a duplicate.
export function findSignup(signups, name) {
  const key = name.trim().toLowerCase()
  return signups.find((signup) => signup.name.trim().toLowerCase() === key) ?? null
}

// Update the participant whose name matches, or append a new one.
export function upsertSignup(signups, participant) {
  const existing = findSignup(signups, participant.name)
  if (!existing) {
    return [...signups, { ...participant, id: crypto.randomUUID() }]
  }
  return signups.map((signup) =>
    signup.id === existing.id ? { ...signup, ...participant } : signup
  )
}

export const COMMENT_MAX_LENGTH = 200
