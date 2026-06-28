const API_URL = import.meta.env.VITE_API_URL || ''

/**
 * Send a payment + booking to the backend.
 * The backend charges the card first, then inserts the booking.
 */
export async function createPaymentBooking({ sourceId, bookingPayloads, bookingGroupId }) {
  const response = await fetch(`${API_URL}/api/payments/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceId, bookingPayloads, bookingGroupId }),
  })

  const json = await response.json()

  if (!response.ok) {
    const err = new Error(json.error || 'PAYMENT_FAILED')
    err.detail = json.detail || null
    throw err
  }

  return json
}
