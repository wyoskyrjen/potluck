// The password gate in front of the site.
//
// The password is never in this repo and never reaches the browser. It lives as a
// bcrypt hash in a Supabase table the anon key cannot read, and the only thing exposed
// is verify_site_password(), which takes an attempt and answers true or false. See the
// "Site password gate" section of README-supabase.md for the limits of this -- it gates
// the UI, not the data.

import { getSupabase } from './supabaseClient'

// localStorage rather than sessionStorage, so this is "first visit" rather than "every
// new tab". Switch to window.sessionStorage to ask again once per session instead.
const STORAGE_KEY = 'potluck-unlocked'

export function isUnlocked() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    // Private browsing blocks storage; ask for the password again rather than crash.
    return false
  }
}

export function rememberUnlocked() {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // Storage blocked or full; the unlock still holds until the page is reloaded.
  }
}

// True when the attempt matches, false when it doesn't. Rejects only if the check
// couldn't run at all -- the gate shows that differently from a wrong password, because
// one is the guest's to fix and the other isn't.
export async function verifyPassword(attempt) {
  const { data, error } = await getSupabase().rpc('verify_site_password', { attempt })

  if (error) throw error
  return data === true
}
