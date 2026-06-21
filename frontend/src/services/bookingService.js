
import { basePrice, addonsPrice, computeTip, confirmLabel } from '../data/catalog.js'
import { therapistLabel } from '../data/therapists.js'

// Formats the guest list into the `party` JSONB shape the bookings table expects.
function buildParty(guests) {
  return guests.map((g) => ({
    name: g.primary ? 'You' : `Guest`,
    service: confirmLabel(g.selection, 'en'),
    therapist: therapistLabel(g.therapist),
    addons: g.selection.addonIds ?? [],
  }))
}

export async function submitBooking({ guests, dateTime, details }) {
  const booked = guests.filter((g) => g.confirmed || guests.length === 1)
  const servicesTotal = booked.reduce((s, g) => s + basePrice(g.selection), 0)
  const addonsTotal = booked.reduce((s, g) => s + addonsPrice(g.selection), 0)
  const tip = computeTip(details, servicesTotal + addonsTotal)

  const totalDuration = booked.reduce((sum, g) => {
    // Adjust if you track per-guest duration differently
    return sum + 60
  }, 0)

  const payload = {
    customer_name: details.name.trim(),
    customer_phone: details.phone.trim(),
    customer_email: details.email.trim(),
    booking_date: dateTime.date.toISOString().slice(0, 10), // yyyy-mm-dd
    booking_time: dateTime.time,
    duration_min: totalDuration,
    party: buildParty(booked),
    services_total: servicesTotal,
    addons_total: addonsTotal,
    tip,
    payment: details.payment,
    note: details.note?.trim() || '',
  }

  const API_URL = import.meta.env.VITE_API_URL || ''

  const response = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_customer_name: payload.customer_name,
      p_customer_phone: payload.customer_phone,
      p_customer_email: payload.customer_email,
      p_booking_date: payload.booking_date,
      p_booking_time: payload.booking_time,
      p_duration_min: payload.duration_min,
      p_party: payload.party,
      p_services_total: payload.services_total,
      p_addons_total: payload.addons_total,
      p_tip: payload.tip,
      p_payment: payload.payment,
      p_note: payload.note,
    }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    console.error('Booking submission failed:', errData)
    throw new Error('Could not save your booking. Please try again.')
  }

  const { data } = await response.json()
  return data?.[0] || data
}
