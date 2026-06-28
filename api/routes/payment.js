const { supabase } = require('../lib/supabaseClient')
const client = require('../lib/squareClient')

const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || ''

// Parse "10:00 AM" → minutes from midnight (reused from api.js)
function parseAmPm(str) {
  if (!str) return null;
  const [time, ap] = str.trim().split(' ');
  const [h, m] = time.split(':').map(Number);
  return ((h % 12) + (ap === 'PM' ? 12 : 0)) * 60 + m;
}

/**
 * POST /api/payments/create
 * Body: { sourceId, bookingPayloads, bookingGroupId }
 *
 * 1. Validates availability (same as POST /api/bookings)
 * 2. Creates the booking(s) with payment_status='pending' (so if user closes the
 *    page mid-charge the booking still exists)
 * 3. Charges the card via Square
 * 4. On success → update payment_status='completed'
 *    On failure → update payment_status='failed'
 * 5. Returns booking data + payment info
 */
async function handleCreatePayment(req, res) {
  try {
    const { sourceId, bookingPayloads, bookingGroupId } = req.body
    if (!sourceId || !bookingPayloads?.length) {
      return res.status(400).json({ error: 'Missing sourceId or bookingPayloads' })
    }

    if (!SQUARE_LOCATION_ID) {
      return res.status(500).json({ error: 'SQUARE_LOCATION_ID is not configured' })
    }

    // ══════════════════════════════════════════════════════
    // 1. Validate availability before charging
    // ══════════════════════════════════════════════════════
    const { createLocalBlockedTracker, getAvailabilityData, bookingPayloadFromInput } = require('./api')
    const { isLocallyBlocked, recordBlock } = createLocalBlockedTracker()

    for (let guestIndex = 0; guestIndex < bookingPayloads.length; guestIndex++) {
      const b = bookingPayloads[guestIndex]
      const date = b.p_booking_date
      const time = b.p_booking_time
      const durationMin = b.p_duration_min || 60
      const startMin = parseAmPm(time)

      // 3-hour advance-booking buffer
      const BUFFER_MIN = 180
      const now = new Date()
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      if (date === todayStr && startMin !== null && startMin <= now.getHours() * 60 + now.getMinutes() + BUFFER_MIN) {
        return res.status(409).json({
          error: 'SLOT_UNAVAILABLE',
          guestIndex, time,
          detail: `Guest ${guestIndex + 1}: ${time} is too soon — bookings must be made at least 3 hours in advance.`,
        })
      }

      const partyArray = b.p_party
      const requestedLabel = partyArray?.[0]?.therapist
      const genderFilter = (requestedLabel === 'female' || requestedLabel === 'male') ? requestedLabel : null
      const data = await getAvailabilityData(date, durationMin, genderFilter)

      if (data.closed || !data.slots.includes(time)) {
        return res.status(409).json({
          error: 'SLOT_UNAVAILABLE',
          guestIndex, time,
          detail: `Guest ${guestIndex + 1}: ${time} is not available on this date.`,
        })
      }

      // Assign therapist if not specified
      let therapistId = b.p_therapist_id || null
      if (!therapistId) {
        const candidates = data.staff.filter(s =>
          !data.therapistSlots[s.id]?.unavailable.includes(time) &&
          !isLocallyBlocked(s.id, date, startMin, startMin + durationMin)
        )
        if (candidates.length === 0) {
          return res.status(409).json({
            error: 'SLOT_UNAVAILABLE',
            guestIndex, time,
            detail: `Guest ${guestIndex + 1}: no therapist available at ${time}.`,
          })
        }
        candidates.sort((a, b) => data.therapistFreeSlotCount[b.id] - data.therapistFreeSlotCount[a.id])
        therapistId = candidates[0].id
        b.p_therapist_id = therapistId
        if (partyArray?.[0]) partyArray[0].therapist = candidates[0].name
      }

      recordBlock(therapistId, date, startMin, startMin + durationMin)
    }

    // ══════════════════════════════════════════════════════
    // 2. Insert bookings FIRST with payment_status='pending'
    //    so the booking exists even if the user closes the
    //    page during the Square charge step.
    // ══════════════════════════════════════════════════════
    const { data: pendingBookings, error: insertError } = await supabase
      .from('bookings')
      .insert(bookingPayloads.map(b => ({
        ...bookingPayloadFromInput(b),
        payment_status: 'pending',
      })))
      .select()

    if (insertError) throw insertError

    const bookingIds = pendingBookings.map(b => b.id)

    // ══════════════════════════════════════════════════════
    // 3. Calculate total & charge card
    // ══════════════════════════════════════════════════════
    const subtotalCents = bookingPayloads.reduce((sum, b) => {
      const svc = Math.round((b.p_services_total || 0) * 100)
      const addons = Math.round((b.p_addons_total || 0) * 100)
      const tip = Math.round((b.p_tip || 0) * 100)
      return sum + svc + addons + tip
    }, 0)

    const idempotencyKey = `b_${bookingGroupId?.slice(0,8)}_${Date.now()}`

    const paymentResponse = await client.payments.create({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(subtotalCents),
        currency: 'USD',
      },
      locationId: SQUARE_LOCATION_ID,
      autocomplete: true,
      note: `Booking group ${bookingGroupId}`,
    })

    const payment = paymentResponse.payment
    if (!payment || payment.status !== 'COMPLETED') {
      // Mark bookings as failed so admin knows to investigate
      await supabase.from('bookings').update({ payment_status: 'failed' }).in('id', bookingIds)
      return res.status(402).json({
        error: 'PAYMENT_FAILED',
        detail: payment?.status || 'Card was declined or payment failed.',
      })
    }

    // ══════════════════════════════════════════════════════
    // 4. Payment succeeded — update bookings to completed
    // ══════════════════════════════════════════════════════
    const { data: updatedBookings, error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'completed',
        square_payment_id: payment.id,
        square_order_id: payment.orderId || null,
      })
      .in('id', bookingIds)
      .select()

    if (updateError) throw updateError

    res.json({ data: updatedBookings, payment: { id: payment.id, status: payment.status } })
  } catch (err) {
    console.error('Payment error:', err)
    if (err.errors) {
      return res.status(402).json({
        error: 'PAYMENT_ERROR',
        detail: err.errors.map(e => e.detail).join('; '),
      })
    }
    res.status(500).json({ error: err.message || 'Payment processing failed' })
  }
}

module.exports = { handleCreatePayment }
