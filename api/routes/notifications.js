const { supabase } = require('../lib/supabaseClient')
const { sendBookingEmails, reminderText, followUpText } = require('../lib/emailService')
const { Resend } = require('resend')

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'

let resendClient = null

const router = require('express').Router()

function getResend() {
  if (resendClient) return resendClient
  if (!RESEND_API_KEY) return null
  resendClient = new Resend(RESEND_API_KEY)
  return resendClient
}

/**
 * Parse "10:00 AM" → minutes from midnight
 */
function parseAmPm(str) {
  if (!str) return null
  const [time, ap] = str.trim().split(' ')
  const [h, m] = time.split(':').map(Number)
  return ((h % 12) + (ap === 'PM' ? 12 : 0)) * 60 + m
}

/**
 * Check if a booking's appointment has passed (end time + 3hr buffer)
 */
function isSessionOver(bookingDate, bookingTime, durationMin) {
  const [y, m, d] = bookingDate.split('-').map(Number)
  const startMin = parseAmPm(bookingTime)
  if (startMin === null) return false
  const endMin = startMin + (durationMin || 60) + 180 // +3hr buffer
  const now = new Date()
  const bookingEnd = new Date(y, m - 1, d, Math.floor(endMin / 60), endMin % 60)
  return now > bookingEnd
}

/**
 * Check if a booking is happening within ~12 hours (11.5–12.5h window).
 * Tight window so the reminder fires exactly once per hourly cron.
 */
function isWithin12hr(bookingDate, bookingTime) {
  const [y, m, d] = bookingDate.split('-').map(Number)
  const startMin = parseAmPm(bookingTime)
  if (startMin === null) return false
  const now = new Date()
  const bookingStart = new Date(y, m - 1, d, Math.floor(startMin / 60), startMin % 60)
  const diffMs = bookingStart.getTime() - now.getTime()
  return diffMs > 11.5 * 60 * 60 * 1000 && diffMs <= 12.5 * 60 * 60 * 1000
}

/**
 * Check if the booking was made more than 12 hours before the appointment.
 * If it was made within 12 hours of the appointment, the confirmation email
 * already serves as the reminder — no separate reminder needed.
 */
function wasBookedWellInAdvance(createdAt, bookingDate, bookingTime) {
  if (!createdAt) return false
  const [y, m, d] = bookingDate.split('-').map(Number)
  const startMin = parseAmPm(bookingTime)
  if (startMin === null) return false
  const bookingStart = new Date(y, m - 1, d, Math.floor(startMin / 60), startMin % 60)
  const created = new Date(createdAt)
  const diffMs = bookingStart.getTime() - created.getTime()
  return diffMs > 12 * 60 * 60 * 1000 // more than 12 hours before
}

/**
 * GET /api/cron/notifications
 * Called every hour by Vercel Cron (or setInterval fallback).
 * Sends:
 *   - Reminder emails for appointments within 12 hours
 *   - Follow-up emails for sessions that ended 3+ hours ago
 */
router.get('/notifications', async (req, res) => {
  try {
    const client = getResend()
    if (!client) {
      return res.status(200).json({ ok: false, reason: 'Resend not configured' })
    }

    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    // Look back 2 days so follow-up emails still go out for yesterday's sessions
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    const lookbackDate = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`

    console.log(`Cron running at ${now.toISOString()} — checking from ${lookbackDate}`)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .in('status', ['upcoming', 'completed'])
      .gte('booking_date', lookbackDate)
      .order('booking_date', { ascending: true })

    if (error) throw error

    const sent = { reminders: 0, followups: 0 }

    for (const b of bookings) {
      const date = b.booking_date
      const time = b.booking_time
      const durationMin = b.duration_min || 60

      let party = b.party
      if (typeof party === 'string') {
        try { party = JSON.parse(party) } catch { party = [] }
      }

      // DEBUG: log what we're evaluating for each booking
      const within12 = isWithin12hr(date, time)
      const bookedWell = wasBookedWellInAdvance(b.created_at, date, time)
      console.log(`[CRON] Booking ${b.id} | date=${date} time=${time} status=${b.status} | reminder_sent=${b.reminder_sent} within12hr=${within12} bookedWellInAdvance=${bookedWell}`)

      // ── Template 2: 12hr reminder ──
      // Only send if the booking was made more than 12hrs in advance.
      // If booked within 12hrs of the appointment, the confirmation covers it.
      if (!b.reminder_sent && b.status === 'upcoming' && within12 && bookedWell) {
        try {
          await client.emails.send({
            from: FROM_EMAIL,
            to: b.customer_email,
            subject: 'See You Soon! Your Appointment is Today – Pain Away of Philly 🌿',
            text: reminderText({ booking: b, party, date, time }),
          })
          await supabase.from('bookings').update({ reminder_sent: true }).eq('id', b.id)
          sent.reminders++
          console.log(`Reminder sent to ${b.customer_email} for booking ${b.id}`)
        } catch (err) {
          console.error(`Failed reminder to ${b.customer_email}:`, err.message)
        }
      }

      // ── Template 3: 3hr post-session follow-up ──
      if (!b.followup_sent && isSessionOver(date, time, durationMin)) {
        try {
          await client.emails.send({
            from: FROM_EMAIL,
            to: b.customer_email,
            subject: 'How Are You Feeling? – Pain Away of Philly 💆',
            text: followUpText({ booking: b, party }),
          })
          await supabase.from('bookings').update({ followup_sent: true }).eq('id', b.id)
          sent.followups++
          console.log(`Follow-up sent to ${b.customer_email} for booking ${b.id}`)
        } catch (err) {
          console.error(`Failed follow-up to ${b.customer_email}:`, err.message)
        }
      }
    }

    res.json({ ok: true, ...sent })
  } catch (err) {
    console.error('Notification cron error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
