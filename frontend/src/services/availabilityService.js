import { getLocalDateStr } from '../utils/datetime.js'

const API_URL = import.meta.env.VITE_API_URL || ''

export function guestAvailabilityParams(guest) {
  const therapistId = guest.therapist?.therapistId || null
  const gender =
    !therapistId &&
    (guest.therapist?.mode === 'female' || guest.therapist?.mode === 'male')
      ? guest.therapist.mode
      : null
  return { therapistId, gender }
}

export function availabilityFetchKey(dateStr, durationMin, therapistId, gender, excludeBookingIds = []) {
  const exclude = excludeBookingIds.length ? excludeBookingIds.slice().sort().join('+') : ''
  return `${dateStr}|${durationMin}|${therapistId || ''}|${gender || ''}|${exclude}`
}

export async function fetchAvailability(
  { dateStr, durationMin, therapistId, gender, excludeBookingIds = [] },
  retries = 2,
) {
  const params = new URLSearchParams({
    date: dateStr,
    duration: String(durationMin),
  })
  if (therapistId) params.set('therapistId', therapistId)
  else if (gender) params.set('gender', gender)
  if (excludeBookingIds.length) params.set('excludeBookingIds', excludeBookingIds.join(','))

  let lastErr
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_URL}/api/availability?${params}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load availability')
      }
      return await res.json()
    } catch (err) {
      lastErr = err
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)))
      }
    }
  }
  throw lastErr
}

export { getLocalDateStr }
