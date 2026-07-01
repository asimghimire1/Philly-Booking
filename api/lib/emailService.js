const { Resend } = require('resend')

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'

let resend = null

function getClient() {
  if (resend) return resend
  if (!RESEND_API_KEY) {
    console.warn('Resend not configured — set RESEND_API_KEY in .env')
    return null
  }
  resend = new Resend(RESEND_API_KEY)
  return resend
}

function firstName(name) {
  return (name || '').split(/\s+/)[0] || name
}

function partySummary(party) {
  if (!party || !party.length) return ''
  return party.map((p, i) => {
    const addons = p.addons?.length ? ` + ${p.addons.join(', ')}` : ''
    return `${i + 1}. ${p.name} — ${p.service}${addons}`
  }).join('\n')
}

/**
 * Template 1 — Booking confirmation (sent immediately after booking)
 */
function confirmationText({ booking, party, date, time, servicesTotal, addonsTotal, tip, total }) {
  const guestName = firstName(booking.customer_name)
  const svcLine = party?.[0]?.service || 'Massage'
  const therapistName = party?.[0]?.therapist || 'Any Available'
  const durMin = booking.duration_min || booking.durationMin || ''
  const durLine = durMin ? `\nDuration:    ${durMin} minutes` : ''
  const tipLine = tip > 0 ? `\nTip:         $${tip.toFixed(2)}` : ''

  return `Hi ${guestName},

Thank you for booking with us! We look forward to seeing you. Here are your appointment details:

━━━━━━━━━━━━━━━━━━━━━━
📅 APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━
Date:        ${date}
Time:        ${time}
Service:     ${svcLine}
Therapist:   ${therapistName}
Duration:    ${durMin} minutes
Price:       $${total.toFixed(0)}
${tipLine}
━━━━━━━━━━━━━━━━━━━━━━
📍 FIND US
━━━━━━━━━━━━━━━━━━━━━━
Pain Away of Philly
936 Arch St, 2nd Floor
Philadelphia, PA 19107
(Center City – Chinatown)

📌 Google Maps: https://maps.app.goo.gl/rj9qUJMaYzuRh6re8
━━━━━━━━━━━━━━━━━━━━━━
🕐 HOURS OF OPERATION
━━━━━━━━━━━━━━━━━━━━━━
Monday – Sunday: 10:00 AM – 9:00 PM

━━━━━━━━━━━━━━━━━━━━━━
📞 CONTACT US
━━━━━━━━━━━━━━━━━━━━━━
Phone:    (267) 690-4138
Email:    painawayphilly@gmail.com
Website:  www.painawayofphilly.com

━━━━━━━━━━━━━━━━━━━━━━
⚠️ NEED TO MAKE CHANGES?
━━━━━━━━━━━━━━━━━━━━━━
We kindly ask that you cancel or reschedule at least 24 hours in advance.

• Manage your appointment online: https://book-x7k29.painawayofphilly.com/
• Or call us at: (267) 690-4138

We can't wait to help you feel your best!

With care,
The Pain Away of Philly Team
936 Arch St, 2nd Floor | Philadelphia, PA 19107
www.painawayofphilly.com | (267) 690-4138`
}

/**
 * Template 2 — 12hr reminder (scheduled)
 */
function reminderText({ booking, party, date, time }) {
  const guestName = firstName(booking.customer_name)
  const svcLine = party?.[0]?.service || 'Massage'
  const therapistName = party?.[0]?.therapist || 'Any Available'
  const durMin = booking.duration_min || booking.durationMin || ''
  const durLine = durMin ? `\nDuration:    ${durMin} minutes` : ''

  return `Hi ${guestName},

Just a friendly reminder — your appointment at Pain Away of Philly is coming up soon! We look forward to seeing you.

━━━━━━━━━━━━━━━━━━━━━━
📅 YOUR APPOINTMENT TODAY
━━━━━━━━━━━━━━━━━━━━━━
Date:        ${date}
Time:        ${time}
Service:     ${svcLine}
Therapist:   ${therapistName}
${durLine}

━━━━━━━━━━━━━━━━━━━━━━
💡 A FEW THINGS TO KNOW
━━━━━━━━━━━━━━━━━━━━━━
• We're on the 2nd floor — take the stairs when you arrive.
• Please arrive 5–10 minutes early so we can get you settled and make the most of your session.
• Let your therapist know about any areas of concern or sensitivity before your session begins.

━━━━━━━━━━━━━━━━━━━━━━
📍 FIND US
━━━━━━━━━━━━━━━━━━━━━━
Pain Away of Philly
936 Arch St, 2nd Floor
Philadelphia, PA 19107
(Center City – Chinatown)

📌 Google Maps: https://maps.app.goo.gl/rj9qUJMaYzuRh6re8

━━━━━━━━━━━━━━━━━━━━━━
⚠️ NEED TO CANCEL OR RESCHEDULE?
━━━━━━━━━━━━━━━━━━━━━━
If you need to make changes, please reach out as soon as possible:

• Manage your appointment online: https://book-x7k29.painawayofphilly.com/
• Or call us at: (267) 690-4138

We can't wait to help you feel your best. See you soon!

With care,
The Pain Away of Philly Team
936 Arch St, 2nd Floor | Philadelphia, PA 19107
www.painawayofphilly.com | (267) 690-4138`
}

/**
 * Template 3 — Post-session follow-up (sent after appointment)
 */
function followUpText({ booking, party }) {
  const guestName = firstName(booking.customer_name)

  return `Hi ${guestName},

It's Bin from Pain Away of Philly — I hope you're feeling the difference after your session today!

Your body may continue to release tension over the next 24–48 hours, so drink plenty of water, rest well, and let the treatment do its work.

If you have any questions or concerns about how you're feeling, please don't hesitate to reach out — we're always here for you.

━━━━━━━━━━━━━━━━━━━━━━
⭐ ENJOYED YOUR SESSION?
━━━━━━━━━━━━━━━━━━━━━━
Your experience means the world to us — and a quick Google review helps others in pain find the care they need. It only takes a minute!

👉 Leave us a Google Review: https://g.page/r/CXihjTXMqMZCEBM/review

Thank you so much — we truly appreciate your support.

━━━━━━━━━━━━━━━━━━━━━━
📅 READY FOR YOUR NEXT SESSION?
━━━━━━━━━━━━━━━━━━━━━━
Regular treatment leads to better, longer-lasting results. Whenever you're ready, we'd love to see you again.

• Book online: www.painawayofphilly.com
• Call us: (267) 690-4138
• Hours: Monday – Sunday, 10:00 AM – 9:00 PM

Thank you for trusting us with your care. We look forward to supporting you on your healing journey!

With care,
Bin Wang & The Pain Away of Philly Team
936 Arch St, 2nd Floor | Philadelphia, PA 19107
www.painawayofphilly.com | (267) 690-4138`
}

/**
 * Send customer booking confirmation email via Resend.
 * Only customer emails — admin notifications are handled in-app.
 */
async function sendBookingEmails(bookingOrArray) {
  const client = getClient()
  if (!client) {
    console.log('Resend not configured — skipping email notifications.')
    return
  }

  const bookings = Array.isArray(bookingOrArray) ? bookingOrArray : [bookingOrArray]

  for (const b of bookings) {
    let party = b.party
    if (typeof party === 'string') {
      try { party = JSON.parse(party) } catch { party = [] }
    }
    const date = b.booking_date || b.date
    const time = b.booking_time || b.time
    const servicesTotal = Number(b.services_total || b.servicesTotal || 0)
    const addonsTotal = Number(b.addons_total || b.addonsTotal || 0)
    const tip = Number(b.tip || 0)
    const total = servicesTotal + addonsTotal + tip

    if (!b.customer_email) {
      console.log('No customer email — skipping.')
      continue
    }

    const text = confirmationText({ booking: b, party, date, time, servicesTotal, addonsTotal, tip, total })

    try {
      await client.emails.send({
        from: FROM_EMAIL,
        to: b.customer_email,
        subject: `Your Appointment is Confirmed – Pain Away of Philly`,
        text,
      })
      console.log(`Resend: confirmation sent to ${b.customer_email}`)
    } catch (err) {
      console.error(`Resend: failed to send to ${b.customer_email}:`, err.message)
    }
  }
}

module.exports = { sendBookingEmails, confirmationText, reminderText, followUpText }
