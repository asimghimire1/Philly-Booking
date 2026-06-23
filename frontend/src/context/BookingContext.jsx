import { createContext, useContext, useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { getCombo, selectionMinutes } from '../data/catalog.js'
import { findTherapistById, useTherapists } from '../data/therapists.jsx'
import { submitBooking } from '../services/bookingService.js'
import {
  availabilityFetchKey,
  fetchAvailability,
  guestAvailabilityParams,
  getLocalDateStr,
} from '../services/availabilityService.js'
import { computeGuestAvailability } from '../utils/availability.js'
import { parseAmPm, findNextAvailableSlot } from '../utils/datetime.js'
import { timeSlotsFor } from '../data/timeslots.js'

// Default therapist preference: the roster is shown ("pick by name") so guests
// can choose, but nobody is pre-selected.
const defaultTherapist = () => ({ mode: 'none', therapistId: null })

const BookingContext = createContext(null)

// A fresh per-guest service selection. A category is pre-opened so the options
// are visible, but nothing is pre-picked — so the summary stays $0 until the
// guest actually chooses a duration/technique.
function defaultSelection() {
  return {
    mode: 'single', // 'single' | 'combo'
    categoryId: 'body',
    durationId: null,
    pickId: null, // technique id (duration cat) or service id (fixed cat)
    comboId: 'combo2',
    slots: [null, null],
    addonIds: [],
  }
}

// Booking always starts with just the primary guest ("You"). The first guest is
// active immediately, so it gets a working selection up front.
const defaultDateTime = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return { date: d, time: null }
}

const initialGuests = [
  {
    id: 1,
    primary: true,
    selection: defaultSelection(),
    confirmed: false,
    therapist: defaultTherapist(),
    dateTime: defaultDateTime(),
  },
]

export function BookingProvider({ children }) {
  const { therapists } = useTherapists()
  const [guests, setGuests] = useState(initialGuests)
  const guestsRef = useRef(guests)
  guestsRef.current = guests
  const [nextId, setNextId] = useState(2)
  const [activeId, setActiveId] = useState(1)

  // Update one guest immutably.
  const patchGuest = (id, patch) =>
    setGuests((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, ...(typeof patch === 'function' ? patch(g) : patch) }
          : g,
      ),
    )

  const patchSelection = (id, patch) =>
    patchGuest(id, (g) => ({
      selection: { ...(g.selection ?? defaultSelection()), ...patch },
    }))

  // Open a guest's editor, giving it a working selection if it doesn't have one.
  const activateGuest = (id) => {
    patchGuest(id, (g) => (g.selection ? {} : { selection: defaultSelection() }))
    setActiveId(id)
  }

  const addGuest = () => {
    const id = nextId
    // If nobody is being edited (all confirmed), open the new guest right away.
    const startNow = activeId === null
    setGuests((prev) => [
      ...prev,
      {
        id,
        primary: false,
        selection: startNow ? defaultSelection() : null,
        confirmed: false,
        therapist: defaultTherapist(),
        dateTime: defaultDateTime(),
      },
    ])
    setNextId((n) => n + 1)
    if (startNow) setActiveId(id)
  }

  const removeGuest = (id) => {
    const remaining = guests.filter((g) => g.id !== id || g.primary)
    setGuests(remaining)
    if (id === activeId) {
      const next = remaining.find((g) => !g.confirmed)
      if (next) activateGuest(next.id)
      else setActiveId(null)
    }
  }

  const setMode = (id, mode) => patchSelection(id, { mode })

  // Switching category clears the duration/technique so nothing is auto-priced —
  // the guest picks within the new category.
  const setCategory = (id, categoryId) =>
    patchSelection(id, { categoryId, pickId: null, durationId: null })

  const setDuration = (id, durationId) => patchSelection(id, { durationId })
  const setPick = (id, pickId) => patchSelection(id, { pickId })
  const setCombo = (id, comboId) => {
    const size = getCombo(comboId)?.slots ?? 0
    patchSelection(id, { comboId, slots: Array(size).fill(null) })
  }

  const updateSlot = (id, index, value) =>
    patchGuest(id, (g) => {
      const slots = [...(g.selection?.slots ?? [])]
      slots[index] = value
      return { selection: { ...g.selection, slots } }
    })

  const toggleAddon = (id, addonId) =>
    patchGuest(id, (g) => {
      const set = new Set(g.selection?.addonIds ?? [])
      set.has(addonId) ? set.delete(addonId) : set.add(addonId)
      return { selection: { ...g.selection, addonIds: [...set] } }
    })

  const confirmGuest = (id) => {
    patchGuest(id, { confirmed: true })
    // Advance to the next guest that still needs a service (if any).
    const next = guests.find((g) => g.id !== id && !g.confirmed)
    if (next) activateGuest(next.id)
    else setActiveId(null)
  }

  const editGuest = (id) => activateGuest(id)

  // ---- therapist preference (per guest) ----
  const setTherapistMode = (id, mode) =>
    patchGuest(id, (g) => {
      let therapistId = g.therapist?.therapistId ?? null
      // Drop a picked therapist that no longer fits the chosen mode.
      if (mode === 'none') therapistId = null
      else if (mode === 'female' || mode === 'male') {
        if (findTherapistById(therapists, therapistId)?.gender !== mode) therapistId = null
      }
      return { therapist: { mode, therapistId } }
    })

  const setTherapist = (id, therapistId) =>
    patchGuest(id, (g) => ({ therapist: { ...g.therapist, therapistId } }))

  // ---- date & time (per guest) ----
  const setGuestDate = (id, date) => {
    setDateTimeShortfall(0)
    patchGuest(id, (g) => ({ dateTime: { date, time: null } }))
  }

  const setGuestTime = (id, time) => {
    setDateTimeShortfall(0)
    patchGuest(id, (g) => ({ dateTime: { ...(g.dateTime || defaultDateTime()), time } }))
  }

  // ---- details & checkout ----
  const [details, setDetails] = useState({
    name: '',
    phone: '',
    email: '',
    note: '',
    tipMode: '25', // '20' | '25' | '30' | 'custom' | 'later'
    tipCustom: '',
    payment: 'prepay', // 'prepay' | 'visit'
    waiver: false,
  })
  const patchDetails = (patch) => setDetails((d) => ({ ...d, ...patch }))

  // ---- flow progress (URL can go back, not skip ahead) ----
  const [maxStep, setMaxStep] = useState(1)
  const unlockStep = (n) => setMaxStep((m) => Math.max(m, n))

  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitErrorDetail, setSubmitErrorDetail] = useState(null)
  const [bookingRef, setBookingRef] = useState(null)
  const [dateTimeApplying, setDateTimeApplying] = useState(false)
  const [guestAvailabilityLoading, setGuestAvailabilityLoadingState] = useState({})
  const [dateTimeShortfall, setDateTimeShortfall] = useState(0)
  const [applySettling, setApplySettling] = useState(false)
  const applyGuestIdsRef = useRef([])

  const setGuestAvailabilityLoading = useCallback((guestId, loading) => {
    setGuestAvailabilityLoadingState((prev) => {
      if (prev[guestId] === loading) return prev
      return { ...prev, [guestId]: loading }
    })
  }, [])

  const dateTimeConfiguring =
    dateTimeApplying ||
    applySettling ||
    Object.values(guestAvailabilityLoading).some(Boolean)

  // Only release the apply lock after times are written AND every guest grid finishes loading.
  useEffect(() => {
    if (!applySettling) return
    const ids = applyGuestIdsRef.current
    if (ids.length === 0) return
    const allDone = ids.every((id) => guestAvailabilityLoading[id] === false)
    if (!allDone) return

    const timer = setTimeout(() => {
      setApplySettling(false)
      setDateTimeApplying(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [applySettling, guestAvailabilityLoading])

  const completeBooking = async () => {
    setSubmitting(true)
    setSubmitError(null)
    setSubmitErrorDetail(null)
    try {
      const saved = await submitBooking({ guests, details })
      const savedArr = Array.isArray(saved) ? saved : [saved]

      // The backend may have auto-assigned a therapist. Update our local context
      // so the Confirmation Page displays the actual assigned name instead of "No preference".
      const bookedGuests = guests.filter((g) => g.confirmed || guests.length === 1)
      setGuests((prev) =>
        prev.map((g) => {
          if (!(g.confirmed || guests.length === 1)) return g
          const idx = bookedGuests.findIndex((bg) => bg.id === g.id)
          const row = savedArr[idx]
          if (row && row.therapist_id) {
            return { ...g, therapist: { mode: 'name', therapistId: row.therapist_id } }
          }
          return g
        })
      )

      const refs = savedArr.map((b) => b.ref)
      setBookingRef(refs)
      setCompleted(true)
      return { success: true }
    } catch (err) {
      setSubmitError(err.message)
      setSubmitErrorDetail(err.detail || null)
      return { success: false, error: err.message, detail: err.detail }
    } finally {
      setSubmitting(false)
    }
  }

  const resetBooking = () => {
    setGuests(initialGuests)
    setNextId(2)
    setActiveId(1)
    setDetails({
      name: '',
      phone: '',
      email: '',
      note: '',
      tipMode: '25',
      tipCustom: '',
      payment: 'prepay',
      waiver: false,
    })
    setMaxStep(1)
    setCompleted(false)
    setSubmitting(false)
    setSubmitError(null)
    setSubmitErrorDetail(null)
    setBookingRef(null)
    setDateTimeShortfall(0)
    setDateTimeApplying(false)
    setApplySettling(false)
    setGuestAvailabilityLoadingState({})
  }

  const allConfirmed = guests.every((g) => g.confirmed)

  // ---- copy to all ----
  const copyServicesToAll = () => {
    setGuests((prev) => {
      const primarySel = prev[0].selection
      if (!primarySel) return prev
      return prev.map((g, i) =>
        i === 0 ? g : { ...g, selection: JSON.parse(JSON.stringify(primarySel)), confirmed: true }
      )
    })
    setActiveId(null)
  }

  const copyTherapistToAll = () => {
    setGuests((prev) => {
      const primaryTherapist = prev[0].therapist
      return prev.map((g, i) => (i === 0 ? g : { ...g, therapist: { ...primaryTherapist } }))
    })
  }

  const copyDateTimeToAll = async () => {
    const snapshot = guestsRef.current
    const primary = snapshot[0]
    const dt = primary?.dateTime
    if (!dt?.date || !dt?.time) return

    setDateTimeShortfall(0)
    setApplySettling(false)
    setDateTimeApplying(true)
    applyGuestIdsRef.current = snapshot.map((g) => g.id)
    try {
      const dateStr = getLocalDateStr(dt.date)
      const claims = []
      const dateTimeById = new Map()
      const availabilityCache = new Map()

      const loadAvailability = async (g) => {
        const durationMin = selectionMinutes(g.selection)
        const { therapistId, gender } = guestAvailabilityParams(g)
        const key = availabilityFetchKey(dateStr, durationMin, therapistId, gender)
        if (availabilityCache.has(key)) return availabilityCache.get(key)

        const json = await fetchAvailability({ dateStr, durationMin, therapistId, gender })
        availabilityCache.set(key, json)
        return json
      }

      const assignTimes = (getJson) => {
        claims.length = 0
        dateTimeById.clear()

        for (let i = 0; i < snapshot.length; i++) {
          const g = snapshot[i]
          const durationMin = selectionMinutes(g.selection)
          const { therapistId, gender } = guestAvailabilityParams(g)

          if (i > 0 && !dateTimeById.get(snapshot[i - 1].id)) {
            dateTimeById.set(g.id, null)
            continue
          }

          const json = getJson(g)
          if (json?.closed) {
            dateTimeById.set(g.id, null)
            continue
          }

          // Prefer the same start time for each guest; only move forward when that guest's own pool cannot take it.
          let time = dt.time

          if (json && time) {
            const { slots, unavailable } = computeGuestAvailability(json, {
              dateStr,
              durationMin,
              therapistId,
              gender,
              claimedTherapistSlots: claims,
              therapists,
            })

            if (i === 0) {
              if (!slots.includes(dt.time) || unavailable.has(dt.time)) {
                time = findNextAvailableSlot(slots, unavailable, parseAmPm(dt.time))
              }
            } else if (!slots.includes(time) || unavailable.has(time)) {
              time = findNextAvailableSlot(slots, unavailable, parseAmPm(dt.time))
            }
          }

          dateTimeById.set(g.id, time ?? null)
          if (time) claims.push({ therapistId, gender, time, durationMin })
        }
      }

      // Fetch each unique availability profile once, then assign staggered times.
      const uniqueKeys = new Set()
      for (const g of snapshot) {
        const durationMin = selectionMinutes(g.selection)
        const { therapistId, gender } = guestAvailabilityParams(g)
        uniqueKeys.add(availabilityFetchKey(dateStr, durationMin, therapistId, gender))
      }

      await Promise.all(
        [...uniqueKeys].map(async (key) => {
          const g = snapshot.find((guest) => {
            const durationMin = selectionMinutes(guest.selection)
            const { therapistId, gender } = guestAvailabilityParams(guest)
            return availabilityFetchKey(dateStr, durationMin, therapistId, gender) === key
          })
          await loadAvailability(g)
        }),
      )

      const firstJson = availabilityCache.values().next().value
      if (firstJson?.closed) {
        setGuests((prev) =>
          prev.map((guest) => ({
            ...guest,
            dateTime: { date: new Date(dt.date.getTime()), time: null },
          })),
        )
        setDateTimeApplying(false)
        setApplySettling(false)
        return
      }

      assignTimes((g) => {
        const durationMin = selectionMinutes(g.selection)
        const { therapistId, gender } = guestAvailabilityParams(g)
        const key = availabilityFetchKey(dateStr, durationMin, therapistId, gender)
        return availabilityCache.get(key)
      })

      setGuests((prev) =>
        prev.map((g) => {
          const time = dateTimeById.get(g.id)
          return {
            ...g,
            dateTime: {
              date: new Date(dt.date.getTime()),
              time: time ?? null,
            },
          }
        }),
      )
      setDateTimeShortfall(snapshot.filter((g) => !dateTimeById.get(g.id)).length)
      setGuestAvailabilityLoadingState(Object.fromEntries(snapshot.map((g) => [g.id, true])))
      setApplySettling(true)
    } catch {
      const dateTimeById = new Map()

      for (let i = 0; i < snapshot.length; i++) {
        dateTimeById.set(snapshot[i].id, dt.time)
      }

      setGuests((prev) =>
        prev.map((g) => ({
          ...g,
          dateTime: {
            date: new Date(dt.date.getTime()),
            time: dateTimeById.get(g.id) ?? null,
          },
        })),
      )
      setDateTimeShortfall(snapshot.filter((g) => !dateTimeById.get(g.id)).length)
      setGuestAvailabilityLoadingState(Object.fromEntries(snapshot.map((g) => [g.id, true])))
      setApplySettling(true)
    }
  }

  const value = useMemo(
    () => ({
      guests,
      activeId,
      addGuest,
      removeGuest,
      activateGuest,
      setMode,
      setCategory,
      setDuration,
      setPick,
      setCombo,
      updateSlot,
      toggleAddon,
      confirmGuest,
      editGuest,
      setTherapistMode,
      setTherapist,
      setGuestDate,
      setGuestTime,
      copyServicesToAll,
      copyTherapistToAll,
      copyDateTimeToAll,
      dateTimeApplying,
      dateTimeConfiguring,
      dateTimeShortfall,
      setGuestAvailabilityLoading,
      details,
      patchDetails,
      maxStep,
      unlockStep,
      completed,
      completeBooking,
      submitting,
      submitError,
      submitErrorDetail,
      bookingRef,
      allConfirmed,
      resetBooking,
    }),
    [guests, activeId, nextId, details, maxStep, completed, allConfirmed, submitting, submitError, submitErrorDetail, bookingRef, dateTimeApplying, applySettling, guestAvailabilityLoading, dateTimeShortfall, therapists],
  )

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within a BookingProvider')
  return ctx
}
