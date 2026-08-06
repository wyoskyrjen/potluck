// Sign-up storage for the potluck. Participants live in the `signups` table in
// Supabase, and every screen in the sign-up flow reads and writes through here so the
// shape of a participant is defined in exactly one place.
//
// A participant: { id, name, phone, comment }
//
// The functions that touch the network are async and reject on failure rather than
// swallowing the error, so each page can show its own loading and error state.

import { getSupabase } from './supabaseClient'

export const COMMENT_MAX_LENGTH = 200

// Postgres' unique-violation SQLSTATE. The signups table has a unique index on the
// lower-cased, trimmed name, so a duplicate name comes back as this.
const UNIQUE_VIOLATION = '23505'

// Named so the select lists stay identical between the list page and a single lookup.
const FIELDS = 'id, name, phone, comment'

// Oldest first, matching the order people signed up in.
export async function loadSignups() {
  const { data, error } = await getSupabase()
    .from('signups')
    .select(FIELDS)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

// Names are matched case- and whitespace-insensitively, so "jenna " finds the
// existing "Jenna" rather than starting a second entry for her.
export function findSignup(signups, name) {
  const key = name.trim().toLowerCase()
  return signups.find((signup) => signup.name.trim().toLowerCase() === key) ?? null
}

// Update the row the caller looked up, or insert a new one when there is no id.
// Updating by id rather than by name means renaming a participant edits their
// existing row instead of leaving the old name behind.
export async function saveSignup(participant) {
  const { id, ...fields } = participant

  const { error } = id
    ? await getSupabase().from('signups').update(fields).eq('id', id)
    : await getSupabase().from('signups').insert(fields)

  if (error) {
    // Two people submitting the same name at once, or renaming someone onto a name
    // that is already taken. Worth a sentence the guest can act on; anything else is
    // a real fault and goes up as-is.
    if (error.code === UNIQUE_VIOLATION) {
      throw new Error(
        `${fields.name} is already signed up. Start over from Sign Up! and enter ` +
          'that name to edit their entry instead.'
      )
    }
    throw error
  }
}
