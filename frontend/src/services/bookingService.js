
import { basePrice, addonsPrice, computeTip, confirmLabel, selectionMinutes } from '../data/catalog.js'
import { therapistLabel } from '../data/therapists.jsx'

// Formats the guest list into the `party` JSONB shape the bookings table expects.
function buildParty(guests) {
  return guests.map((g) => ({
    name: g.primary ? 'You' : `Guest`,
    service: confirmLabel(g.selection, 'en'),
    therapist: therapistLabel(g.therapist),
    addons: g.selection.addonIds ?? [],
    _selection: g.selection,
  }))
}

export async function submitBooking({ guests, details }) {
  const booked = guests.filter((g) => g.confirmed || guests.length === 1)
  const servicesTotal = booked.reduce((s, g) => s + basePrice(g.selection), 0)
  const addonsTotal = booked.reduce((s, g) => s + addonsPrice(g.selection), 0)
  const totalTip = computeTip(details, servicesTotal + addonsTotal)

  const bookingGroupId = crypto.randomUUID()

  const bookingsPayload = booked.map((g) => {
    const getLocalDateStr = (d) => d instanceof Date 
      ? new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 10)
      : String(d).slice(0, 10);
      
    const dateStr = g.dateTime?.date ? getLocalDateStr(g.dateTime.date) : '';

    return {
      p_customer_name: details.name.trim(),
      p_customer_phone: details.phone.trim(),
      p_customer_email: details.email.trim(),
      p_booking_date: dateStr,
      p_booking_time: g.dateTime?.time || '',
      p_duration_min: selectionMinutes(g.selection),
      p_party: buildParty([g]),
      p_services_total: basePrice(g.selection),
      p_addons_total: addonsPrice(g.selection),
      p_tip: g.primary ? totalTip : 0,
      p_payment: details.payment,
      p_note: details.note?.trim() || '',
      p_therapist_id: g.therapist?.therapistId || null,
      p_booking_group_id: bookingGroupId,
      p_waiver_accepted: details.waiver,
    }
  })

  const API_URL = import.meta.env.VITE_API_URL || ''

  const response = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingsPayload),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    console.error('Booking submission failed:', errData)
    if (errData.error === 'SLOT_UNAVAILABLE') {
      const err = new Error('SLOT_UNAVAILABLE')
      if (errData.guestIndex != null) {
        const guestNum = errData.guestIndex + 1
        const time = bookingsPayload[errData.guestIndex]?.p_booking_time
        err.detail =
          errData.detail ||
          `Guest ${guestNum} at ${time}: not enough therapists available at that time.`
      } else {
        err.detail = errData.detail || null
      }
      throw err
    }
    throw new Error('Could not save your booking. Please try again.')
  }

  const { data } = await response.json()
  return data
}
