import { createContext, useContext, useMemo, useState } from 'react'
import { getCombo } from '../data/catalog.js'
import { getTherapist } from '../data/therapists.js'

// Default therapist preference: the roster is shown ("pick by name") so guests
// can choose, but nobody is pre-selected.
const defaultTherapist = () => ({ mode: 'name', therapistId: null })

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
const initialGuests = [
  {
    id: 1,
    primary: true,
    selection: defaultSelection(),
    confirmed: false,
    therapist: defaultTherapist(),
  },
]

export function BookingProvider({ children }) {
  const [guests, setGuests] = useState(initialGuests)
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
        if (getTherapist(therapistId)?.gender !== mode) therapistId = null
      }
      return { therapist: { mode, therapistId } }
    })

  const setTherapist = (id, therapistId) =>
    patchGuest(id, (g) => ({ therapist: { ...g.therapist, therapistId } }))

  // ---- date & time (whole party) ----
  const [dateTime, setDateTime] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return { date: d, time: null }
  })
  // Changing the date clears the time, since availability differs per day.
  const setDate = (date) => setDateTime({ date, time: null })
  const setTime = (time) => setDateTime((s) => ({ ...s, time }))

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
  const completeBooking = () => setCompleted(true)

  const allConfirmed = guests.every((g) => g.confirmed)

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
      dateTime,
      setDate,
      setTime,
      details,
      patchDetails,
      maxStep,
      unlockStep,
      completed,
      completeBooking,
      allConfirmed,
    }),
    [guests, activeId, nextId, dateTime, details, maxStep, completed, allConfirmed],
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
