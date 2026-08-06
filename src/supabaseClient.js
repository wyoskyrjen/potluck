// The one Supabase connection the app uses. Everything else talks to the database
// through src/signups.js and src/menu.js, so this file is the only place that knows
// how the connection is configured.

import { createClient } from '@supabase/supabase-js'

// Vite only exposes env vars prefixed with VITE_ to browser code. Both of these live
// in .env.local, which the existing `*.local` rule in .gitignore already keeps out of
// the repo. Note that Vite inlines them into the bundle at build time -- the anon key
// is public once the site is deployed, which is expected; the RLS policies in
// supabase/schema.sql are what actually protect the data.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client = null

// Built on first use rather than at import time. If the env vars are missing we want
// the pages to still render and show their normal error state -- creating the client
// at import would throw during module evaluation and leave a blank white screen with
// nothing but a console message to go on.
export function getSupabase() {
  if (!client) {
    if (!url || !anonKey) {
      throw new Error(
        'Supabase is not configured. Copy .env.example to .env.local, fill in ' +
          'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from the Supabase dashboard ' +
          '(Project Settings > API Keys), then restart the dev server.'
      )
    }
    client = createClient(url, anonKey)
  }
  return client
}
