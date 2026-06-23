export function parseAmPm(str) {
  if (!str) return null
  const [time, ap] = str.trim().split(' ')
  const [h, m] = time.split(':').map(Number)
  return ((h % 12) + (ap === 'PM' ? 12 : 0)) * 60 + m
}

export function getLocalDateStr(d) {
  if (!d) return ''
  return d instanceof Date
    ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
    : String(d).slice(0, 10)
}

export function findNextAvailableSlot(slots, unavailable, minMins = 0) {
  return slots.find((s) => !unavailable.has(s) && parseAmPm(s) >= minMins) || null
}

export function staggerSlotAfter(localSlots, prevTime, durationMin) {
  if (!prevTime) return null
  const minStart = parseAmPm(prevTime) + durationMin
  return localSlots.find((s) => parseAmPm(s) >= minStart) || null
}
