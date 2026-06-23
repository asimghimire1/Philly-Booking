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

// Start times for an appointment of `durationMin`, spaced by 30-min steps
// so each session starts on a half-hour boundary and still ends by closing time.
export function timeSlotsFor(durationMin) {
  const dur = durationMin || 60
  const step = 30
  const slots = []
  for (let t = OPEN_MIN; t + dur <= CLOSE_MIN; t += step) {
    slots.push(fmt(t))
  }
  return slots
}
