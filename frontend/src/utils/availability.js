import { parseAmPm } from './datetime.js'
import { findTherapistById } from '../data/therapists.jsx'

/**
 * Apply in-flow guest claims on top of API availability data.
 * Mirrors the logic in useAvailability so apply-to-all picks the same slots.
 */
export function computeGuestAvailability(
  json,
  { dateStr, durationMin, therapistId, gender, claimedTherapistSlots = [], therapists = [] },
) {
  if (json.closed) {
    return { slots: [], unavailable: new Set(), closed: true }
  }

  const adjustedCount = { ...json.availableCount }

  for (const claim of claimedTherapistSlots) {
    const claimTherapist = claim.therapistId ? findTherapistById(therapists, claim.therapistId) : null
    const claimGender = claim.gender || claimTherapist?.gender || null
    if (gender && claimGender && gender !== claimGender) continue

    const claimStart = parseAmPm(claim.time)
    if (!claimStart || !claim.durationMin) continue
    const claimEnd = claimStart + claim.durationMin

    for (const slotStr of json.slots) {
      const slotStart = parseAmPm(slotStr)
      const slotEnd = slotStart + durationMin
      if (slotStart < claimEnd && slotEnd > claimStart) {
        if (adjustedCount[slotStr] !== undefined) {
          adjustedCount[slotStr] = Math.max(0, adjustedCount[slotStr] - 1)
        }
      }
    }
  }

  let unavailableSet = new Set()
  if (therapistId) {
    const therapistUnavail = new Set(json.therapistSlots[therapistId]?.unavailable || [])

    for (const claim of claimedTherapistSlots) {
      if (claim.therapistId === therapistId) {
        const claimStart = parseAmPm(claim.time)
        if (!claimStart || !claim.durationMin) continue
        const claimEnd = claimStart + claim.durationMin

        for (const slotStr of json.slots) {
          const slotStart = parseAmPm(slotStr)
          const slotEnd = slotStart + durationMin
          if (slotStart < claimEnd && slotEnd > claimStart) {
            therapistUnavail.add(slotStr)
          }
        }
      }
    }
    unavailableSet = therapistUnavail
  } else {
    for (const slotStr of json.slots) {
      if ((adjustedCount[slotStr] || 0) < 1) {
        unavailableSet.add(slotStr)
      }
    }
  }

  return { slots: json.slots, unavailable: unavailableSet, closed: false }
}
