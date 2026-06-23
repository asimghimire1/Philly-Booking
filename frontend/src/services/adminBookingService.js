export async function updateBookings(bookingsPayload) {
  const API_URL = import.meta.env.VITE_API_URL || ''
  const response = await fetch(`${API_URL}/api/admin/bookings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookings: bookingsPayload }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    if (errData.error === 'SLOT_UNAVAILABLE') {
      const err = new Error('SLOT_UNAVAILABLE')
      err.detail = errData.detail || null
      err.guestIndex = errData.guestIndex
      throw err
    }
    throw new Error(errData.detail || errData.error || 'Could not save booking changes.')
  }

  const { data } = await response.json()
  return data
}
