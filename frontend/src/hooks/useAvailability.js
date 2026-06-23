import { useState, useEffect, useRef } from 'react'
import { fetchAvailability } from '../services/availabilityService.js'
import { computeGuestAvailability } from '../utils/availability.js'

/**
 * Fetches real-time slot availability from the backend.
 *
 * @param {object} params
 * @param {Date}   params.date         - Selected date
 * @param {number} params.durationMin  - Session length in minutes
 * @param {string|null} params.therapistId - Specific therapist ID, or null for "any"
 * @param {number} params.claimedCount - How many "no-preference" slots other guests in this
 *                                       flow have already claimed (reduces available count)
 * @param {Array}  params.claimedTherapistSlots - [{therapistId, time}] claimed by other guests
 * @param {Array}  params.therapists - Live therapist roster for resolving named selections
 */
export function useAvailability({
  date,
  durationMin,
  therapistId,
  gender,
  claimedCount = 0,
  claimedTherapistSlots = [],
  therapists = [],
  refreshTick = 0,
  excludeBookingIds = [],
}) {
  const [state, setState] = useState({
    slots: [],
    unavailable: new Set(),
    availableCount: {},
    therapistSlots: {},
    closed: false,
    loading: true,
    error: null,
  })

  const timerRef = useRef(null)
  const requestKeyRef = useRef('')

  useEffect(() => {
    if (!date || !durationMin) return

    const dateStr = date instanceof Date
      ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 10)
      : date

    const requestKey = `${dateStr}-${durationMin}-${therapistId || ''}-${gender || ''}-${claimedCount}-${refreshTick}-${excludeBookingIds.join('+')}`
    requestKeyRef.current = requestKey

    setState((s) => ({ ...s, slots: [], unavailable: new Set(), loading: true, error: null }))

    const run = async () => {
      try {
        const json = await fetchAvailability({
          dateStr,
          durationMin,
          therapistId,
          gender: therapistId ? null : gender,
          excludeBookingIds,
        })

        // Drop stale responses when the date/therapist changed while this fetch was in flight.
        if (requestKeyRef.current !== requestKey) return

        if (json.closed) {
          setState({ slots: [], unavailable: new Set(), availableCount: {}, therapistSlots: {}, closed: true, loading: false, error: null })
          return
        }

        const { slots, unavailable } = computeGuestAvailability(json, {
          dateStr,
          durationMin,
          therapistId,
          gender: therapistId ? null : gender,
          claimedTherapistSlots,
          therapists,
        })

        if (requestKeyRef.current !== requestKey) return

        setState({
          slots,
          unavailable,
          availableCount: json.availableCount,
          therapistSlots: json.therapistSlots,
          closed: false,
          loading: false,
          error: null,
        })
      } catch (err) {
        if (requestKeyRef.current !== requestKey) return
        setState((s) => ({ ...s, loading: false, error: err.message }))
      }
    }

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(run, 250)

    return () => clearTimeout(timerRef.current)
  }, [date, durationMin, therapistId, gender, claimedCount, refreshTick, JSON.stringify(claimedTherapistSlots), JSON.stringify(therapists), JSON.stringify(excludeBookingIds)])

  return state
}
