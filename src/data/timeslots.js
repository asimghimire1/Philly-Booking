// Fixed appointment start times offered each day.
export const timeSlots = [
  '9:00 AM',
  '10:30 AM',
  '12:00 PM',
  '1:30 PM',
  '3:00 PM',
  '4:30 PM',
  '6:00 PM',
  '7:30 PM',
]

// Deterministic "availability" per date so the grid varies realistically by day
// (stands in for real therapist-calendar filtering — brief §6).
export function unavailableSlots(date) {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  let h = 0
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const a = timeSlots[h % timeSlots.length]
  const b = timeSlots[(h >> 4) % timeSlots.length]
  return new Set([a, b])
}
