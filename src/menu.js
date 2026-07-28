// Menu storage for the potluck. Like signups.js this is localStorage only — there
// is no backend — and every menu screen reads and writes through here so the shape
// of an item is defined in exactly one place.
//
// A menu item: { id, name, bringer, diets, ingredients }
//   diets:       ids from DIETS below
//   ingredients: one string per ingredient

const STORAGE_KEY = 'potluck-menu'

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

export function loadMenu() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Private browsing or a corrupted value — start empty instead of crashing.
    return []
  }
}

export function saveMenu(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage blocked or full; the change still applies for this visit.
  }
}

export function findItem(items, id) {
  return items.find((item) => item.id === id) ?? null
}

// Update the item with a matching id, or append a new one. An item without an id
// has never been saved, which is how the form signals "new" rather than "edit".
export function upsertItem(items, item) {
  if (!item.id) {
    return [...items, { ...item, id: crypto.randomUUID() }]
  }
  return items.map((existing) =>
    existing.id === item.id ? { ...existing, ...item } : existing
  )
}

// Badges always read in the order DIETS declares them, no matter what order they
// were checked in. Ids no longer in DIETS simply drop out.
export function dietsFor(ids = []) {
  return DIETS.filter((diet) => ids.includes(diet.id))
}

// The form edits ingredients as one-per-line text; storage keeps them as an array.
export function parseIngredients(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function formatIngredients(ingredients = []) {
  return ingredients.join('\n')
}
