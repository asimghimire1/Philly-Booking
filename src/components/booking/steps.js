// Central definition of the 5-step booking flow.
// `key` maps to translation entries (steps.<key>.label / .short).
export const steps = [
  { n: 1, key: 'party', path: '/' },
  { n: 2, key: 'services', path: '/services' },
  { n: 3, key: 'therapist', path: '/therapist' },
  { n: 4, key: 'dateTime', path: '/date-time' },
  { n: 5, key: 'details', path: '/details' },
]

export function stepForPath(pathname) {
  const match = steps.find((s) => s.path === pathname)
  return match ? match.n : 1
}

// Path of the step after the given step number, or null if it's the last.
export function nextPath(stepN) {
  const next = steps.find((s) => s.n === stepN + 1)
  return next ? next.path : null
}

// Path of the step before the given step number, or null if it's the first.
export function prevPath(stepN) {
  const prev = steps.find((s) => s.n === stepN - 1)
  return prev ? prev.path : null
}
