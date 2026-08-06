// Menu storage for the potluck. Dishes live in the `menu_items` table in Supabase,
// and every menu screen reads and writes through here so the shape of an item is
// defined in exactly one place.
//
// A menu item: { id, name, bringer, diets, ingredients }
//   diets:       ids from DIETS below
//   ingredients: one string per ingredient
//
// The functions that touch the network are async and reject on failure rather than
// swallowing the error, so each page can show its own loading and error state. The
// diet and ingredient helpers below are pure -- they only reshape data in memory.

import { getSupabase } from './supabaseClient'

// The five diet callouts from the design. Item cards, the add/edit form, and the
// legend band all render from this list, so adding a sixth means editing one place.
// The abbreviation is what appears on a card; the legend spells out the label.
export const DIETS = [
  { id: 'vegetarian', abbr: 'V', label: 'Vegetarian' },
  { id: 'vegan', abbr: 'VG', label: 'Vegan' },
  { id: 'pescatarian', abbr: 'P', label: 'Pescatarian' },
  { id: 'lactose-free', abbr: 'LF', label: 'Lactose free' },
  { id: 'gluten-free', abbr: 'GF', label: 'Gluten free' },
]

// Postgres' SQLSTATE for a failed cast, which is what a non-uuid id in the URL hits.
const INVALID_TEXT_REPRESENTATION = '22P02'

// Named so the select lists stay identical between the grid and a single lookup.
const FIELDS = 'id, name, bringer, diets, ingredients'

// Oldest first, so adding a dish appends to the end of the grid.
export async function loadMenu() {
  const { data, error } = await getSupabase()
    .from('menu_items')
    .select(FIELDS)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

// One dish by id, or null if there is no such dish.
export async function loadItem(id) {
  const { data, error } = await getSupabase()
    .from('menu_items')
    .select(FIELDS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    // A hand-edited URL can put something that isn't a uuid in the path. Postgres
    // rejects the cast, which for our purposes means the same thing as "no such item"
    // and gets the same "no longer on the menu" screen.
    if (error.code === INVALID_TEXT_REPRESENTATION) return null
    throw error
  }
  return data
}

// Update the dish the caller looked up, or insert a new one when there is no id.
export async function saveItem(item) {
  const { id, ...fields } = item

  const { error } = id
    ? await getSupabase().from('menu_items').update(fields).eq('id', id)
    : await getSupabase().from('menu_items').insert(fields)

  if (error) throw error
}

// Badges always read in the order DIETS declares them, no matter what order they were
// checked in. Ids no longer in DIETS simply drop out.
export function dietsFor(ids) {
  const selected = ids ?? []
  return DIETS.filter((diet) => selected.includes(diet.id))
}

// The form edits ingredients as one-per-line text; the database keeps them as an array.
export function parseIngredients(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function formatIngredients(ingredients) {
  return (ingredients ?? []).join('\n')
}
