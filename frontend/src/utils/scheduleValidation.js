import { guestAvailabilityParams } from '../services/availabilityService.js'
import { getLocalDateStr, parseAmPm } from './datetime.js'

function sessionDuration(entry, selectionMinutes) {
  return selectionMinutes(entry.g.selection)
}

function sessionRange(entry, selectionMinutes) {
  const start = parseAmPm(entry.g.dateTime.time)
  const duration = sessionDuration(entry, selectionMinutes)
  return { start, end: start + duration, duration }
}

function rangesOverlap(a, b) {
  return a.start < b.end && b.start < a.end
}

function eligibleTherapistIds(guest, therapists) {
  const { therapistId, gender } = guestAvailabilityParams(guest)
  if (therapistId) return [therapistId]
  if (gender === 'female' || gender === 'male') {
    return therapists.filter((t) => t.gender === gender).map((t) => t.id)
  }
  return therapists.map((t) => t.id)
}

function specificityRank(guest) {
  const { therapistId, gender } = guestAvailabilityParams(guest)
  if (therapistId) return 0
  if (gender === 'female' || gender === 'male') return 1
  return 2
}

function buildGuestOrder(entries, selectionMinutes) {
  return [...entries].sort((a, b) => {
    const rangeA = sessionRange(a, selectionMinutes)
    const rangeB = sessionRange(b, selectionMinutes)
    return (
      rangeA.start - rangeB.start ||
      specificityRank(a.g) - specificityRank(b.g) ||
      rangeB.duration - rangeA.duration ||
      a.guestNum - b.guestNum
    )
  })
}

function cloneAssignments(assignments) {
  const copy = new Map()
  for (const [therapistId, items] of assignments) {
    copy.set(
      therapistId,
      items.map((item) => ({ guestNum: item.guestNum, range: { ...item.range } })),
    )
  }
  return copy
}

function canAssignDate(entries, therapists, selectionMinutes) {
  const ordered = buildGuestOrder(entries, selectionMinutes)
  const assignments = new Map()

  const dfs = (index) => {
    if (index >= ordered.length) return { success: true, assignments: cloneAssignments(assignments) }

    const entry = ordered[index]
    const entryRange = sessionRange(entry, selectionMinutes)
    const eligibleIds = eligibleTherapistIds(entry.g, therapists)

    for (const therapistId of eligibleIds) {
      const current = assignments.get(therapistId) || []
      const overlaps = current.some((other) => rangesOverlap(entryRange, other.range))
      if (overlaps) continue

      current.push({ guestNum: entry.guestNum, range: entryRange })
      assignments.set(therapistId, current)
      const result = dfs(index + 1)
      if (result.success) return result
      current.pop()
    }

    return { success: false, failed: entry, assignments: cloneAssignments(assignments) }
  }

  return dfs(0)
}

export function poolCapacityForGuest(guest, therapists = []) {
  const { therapistId, gender } = guestAvailabilityParams(guest)
  if (therapistId) return 1
  if (gender === 'female') return therapists.filter((t) => t.gender === 'female').length || 1
  if (gender === 'male') return therapists.filter((t) => t.gender === 'male').length || 1
  return therapists.length || 1
}

export function poolLabel(guest, lang = 'en') {
  const { therapistId, gender } = guestAvailabilityParams(guest)
  if (therapistId) return lang === 'zh' ? '所选理疗师' : 'selected therapist'
  if (gender === 'female') return lang === 'zh' ? '女理疗师' : 'female therapists'
  if (gender === 'male') return lang === 'zh' ? '男理疗师' : 'male therapists'
  return lang === 'zh' ? '理疗师' : 'therapists'
}

function sessionsOverlap(timeA, durationA, timeB, durationB) {
  const startA = parseAmPm(timeA)
  const startB = parseAmPm(timeB)
  if (startA == null || startB == null) return false
  return startA < startB + durationB && startB < startA + durationA
}

export function validatePartySchedule(guests, therapists, countsFn, selectionMinutes) {
  const active = guests
    .map((g, index) => ({ g, guestNum: index + 1, index }))
    .filter(({ g }) => countsFn(g) && g.dateTime?.date && g.dateTime?.time)

  const errors = []

  const byDate = new Map()
  for (const entry of active) {
    const dateStr = getLocalDateStr(entry.g.dateTime.date)
    if (!byDate.has(dateStr)) byDate.set(dateStr, [])
    byDate.get(dateStr).push(entry)
  }

  for (const [dateStr, entries] of byDate) {
    const { success, failed, assignments } = canAssignDate(entries, therapists, selectionMinutes)
    if (success) continue

    if (failed) {
      const range = sessionRange(failed, selectionMinutes)
      const blockers = new Set([failed.guestNum])
      const eligibleIds = eligibleTherapistIds(failed.g, therapists)
      for (const therapistId of eligibleIds) {
        const current = assignments.get(therapistId) || []
        for (const other of current) {
          if (rangesOverlap(range, other.range)) blockers.add(other.guestNum)
        }
      }

      errors.push({
        type: 'pool_exhausted',
        time: failed.g.dateTime.time,
        dateStr,
        capacity: poolCapacityForGuest(failed.g, therapists),
        guestNums: [...blockers].sort((a, b) => a - b),
        poolLabel: poolLabel(failed.g),
      })
    }
  }

  return errors
}

export function formatScheduleError(error, t, lang) {
  if (error.type === 'pool_exhausted') {
    return t('datetime.poolExhausted', {
      time: error.time,
      capacity: error.capacity,
      pool: error.poolLabel,
      guests: error.guestNums.join(', '),
    })
  }
  if (error.type === 'therapist_overlap') {
    return t('datetime.therapistOverlap', {
      time: error.time,
      guests: error.guestNums.join(', '),
    })
  }
  return t('datetime.scheduleConflict')
}
