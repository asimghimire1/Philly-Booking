import {
  categories,
  combos,
  durations,
  getCategory,
  getCombo,
  getItems,
  basePrice,
  addonsPrice,
  confirmLabel,
  selectionMinutes,
} from '../data/catalog.js'
import { therapistLabel } from '../data/therapists.jsx'
import { getLocalDateStr } from '../services/availabilityService.js'

function defaultSelection() {
  return {
    mode: 'single',
    categoryId: 'body',
    durationId: null,
    pickId: null,
    comboId: 'combo2',
    slots: [null, null],
    addonIds: [],
  }
}

function parseDateStr(dateStr) {
  if (!dateStr) return new Date()
  const d = new Date(`${dateStr}T12:00:00`)
  d.setHours(0, 0, 0, 0)
  return d
}

function matchDurationFromMinutes(minutes) {
  const match = durations.find((d) => d.minutes === minutes)
  return match?.id ?? '1h'
}

function parseSelectionFromParty(partyMember, durationMin) {
  if (partyMember?._selection) return { ...defaultSelection(), ...partyMember._selection }

  const service = String(partyMember?.service || '')
  const sel = defaultSelection()

  for (const combo of combos) {
    if (service === combo.nameEn || service.startsWith(combo.nameEn)) {
      sel.mode = 'combo'
      sel.comboId = combo.id
      const size = combo.slots ?? 0
      sel.slots = Array(size).fill('body')
      return sel
    }
  }

  const parts = service.split(',').map((s) => s.trim())
  const namePart = parts[0] || ''
  const durPart = parts[1] || ''

  for (const cat of categories) {
    const items = getItems(cat)
    const item = items.find((it) => it.nameEn === namePart || namePart.startsWith(it.nameEn))
    if (!item) continue
    sel.mode = 'single'
    sel.categoryId = cat.id
    sel.pickId = item.id
    if (cat.type === 'duration') {
      const dur = durations.find(
        (d) => durPart.includes(d.short) || d.short === durPart || d.labelEn === durPart,
      )
      sel.durationId = dur?.id ?? matchDurationFromMinutes(durationMin)
    }
    break
  }

  if (partyMember?.addons?.length) {
    sel.addonIds = [...partyMember.addons]
  }

  return sel
}

export function hydrateTherapist(therapistId, partyTherapistLabel, staff = []) {
  if (therapistId) return { mode: 'name', therapistId }
  if (partyTherapistLabel === 'female' || partyTherapistLabel === 'male') {
    return { mode: partyTherapistLabel, therapistId: null }
  }
  if (partyTherapistLabel && partyTherapistLabel !== 'none') {
    const match = staff.find((s) => s.name === partyTherapistLabel)
    if (match) return { mode: 'name', therapistId: match.id }
  }
  return { mode: 'none', therapistId: null }
}

export function hydrateEditState(row, staff = []) {
  const p = row.party?.[0] || {}
  const guest = {
    bookingId: row.id,
    primary: true,
    guestName: p.name || 'Guest',
    selection: parseSelectionFromParty(p, row.durationMin),
    therapist: hydrateTherapist(row.therapistId, p.therapist, staff),
    dateTime: { date: parseDateStr(row.date), time: row.time },
  }

  return {
    ref: row.ref,
    status: row.status,
    customer: { ...row.customer },
    bookingGroupId: row.bookingGroupId || null,
    details: {
      note: row.note || '',
      tip: row.tip ?? 0,
      payment: row.payment || 'prepay',
    },
    guests: [guest],
    excludeBookingIds: [row.id],
  }
}

export function buildPartyEntry(guest) {
  return {
    name: guest.guestName,
    service: confirmLabel(guest.selection, 'en'),
    therapist: therapistLabel(guest.therapist),
    addons: guest.selection?.addonIds ?? [],
    _selection: guest.selection,
  }
}

export function buildUpdatePayloads({ guests, customer, details }) {
  return guests.map((g) => ({
    id: g.bookingId,
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_email: customer.email,
    booking_date: getLocalDateStr(g.dateTime.date),
    booking_time: g.dateTime?.time || '',
    duration_min: selectionMinutes(g.selection),
    therapist_id: g.therapist?.therapistId || null,
    party: [buildPartyEntry(g)],
    services_total: basePrice(g.selection),
    addons_total: addonsPrice(g.selection),
    tip: g.primary ? Number(details.tip) || 0 : 0,
    payment: details.payment,
    note: details.note?.trim() || '',
  }))
}

export function editTotals(guests, details) {
  const servicesTotal = guests.reduce((s, g) => s + basePrice(g.selection), 0)
  const addonsTotal = guests.reduce((s, g) => s + addonsPrice(g.selection), 0)
  const tip = Number(details.tip) || 0
  return { servicesTotal, addonsTotal, tip, total: servicesTotal + addonsTotal + tip }
}

export { defaultSelection, parseSelectionFromParty }
