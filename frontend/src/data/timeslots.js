// Booking hours the studio takes appointments within.
export const OPEN_MIN = 10 * 60 // 10:00 AM
export const CLOSE_MIN = 20 * 60 // 8:00 PM

const fmt = (mins) => {
  let h = Math.floor(mins / 60)
  const m = mins % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${String(m).padStart(2, '0')} ${ap}`
}

// Start times for an appointment of `durationMin`, spaced by that duration so
// each slot is back-to-back and the session still ends by closing time. A
// 30-min service yields 30-min slots, a 1-hr service yields hourly slots, etc.
export function timeSlotsFor(durationMin) {
  const dur = durationMin || 60
  const step = Math.max(30, dur)
  const slots = []
  for (let t = OPEN_MIN; t + dur <= CLOSE_MIN; t += step) {
    slots.push(fmt(t))
  }
  return slots
}

// Deterministic "already booked" marks so the grid varies realistically per day
// (stands in for real therapist-calendar filtering — brief §6).
export function unavailableSlots(date, slots) {
  if (!slots?.length) return new Set()
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  let h = 0
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return new Set([slots[h % slots.length], slots[(h >> 4) % slots.length]])
}
