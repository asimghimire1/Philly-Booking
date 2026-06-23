import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { getCombo } from '../data/catalog.js'
import { defaultSelection } from '../utils/bookingEditUtils.js'

const AdminEditContext = createContext(null)

export function AdminEditProvider({ initial, children }) {
  const [guests, setGuests] = useState(initial.guests)
  const [customer] = useState(initial.customer)
  const [details, setDetails] = useState(initial.details)
  const excludeBookingIds = initial.excludeBookingIds

  const patchGuest = useCallback((bookingId, patch) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.bookingId === bookingId
          ? { ...g, ...(typeof patch === 'function' ? patch(g) : patch) }
          : g,
      ),
    )
  }, [])

  const patchSelection = useCallback(
    (bookingId, patch) =>
      patchGuest(bookingId, (g) => ({
        selection: { ...(g.selection ?? defaultSelection()), ...patch },
      })),
    [patchGuest],
  )

  const setMode = (bookingId, mode) => patchSelection(bookingId, { mode })
  const setCategory = (bookingId, categoryId) =>
    patchSelection(bookingId, { categoryId, pickId: null, durationId: null })
  const setDuration = (bookingId, durationId) => patchSelection(bookingId, { durationId })
  const setPick = (bookingId, pickId) => patchSelection(bookingId, { pickId })
  const setCombo = (bookingId, comboId) => {
    const size = getCombo(comboId)?.slots ?? 0
    patchSelection(bookingId, { comboId, slots: Array(size).fill(null) })
  }
  const updateSlot = (bookingId, index, value) =>
    patchGuest(bookingId, (g) => {
      const slots = [...(g.selection?.slots ?? [])]
      slots[index] = value
      return { selection: { ...g.selection, slots } }
    })
  const toggleAddon = (bookingId, addonId) =>
    patchGuest(bookingId, (g) => {
      const set = new Set(g.selection?.addonIds ?? [])
      set.has(addonId) ? set.delete(addonId) : set.add(addonId)
      return { selection: { ...g.selection, addonIds: [...set] } }
    })

  const setTherapistMode = (bookingId, mode) =>
    patchGuest(bookingId, (g) => ({
      therapist: {
        mode,
        therapistId: mode === 'name' ? g.therapist?.therapistId : null,
      },
    }))
  const setTherapist = (bookingId, therapistId) =>
    patchGuest(bookingId, (g) => ({ therapist: { ...g.therapist, mode: 'name', therapistId } }))

  const setGuestDate = (bookingId, date) =>
    patchGuest(bookingId, (g) => ({ dateTime: { date, time: null } }))
  const setGuestTime = (bookingId, time) =>
    patchGuest(bookingId, (g) => ({
      dateTime: { ...(g.dateTime || { date: new Date(), time: null }), time },
    }))

  const patchDetails = (patch) => setDetails((d) => ({ ...d, ...patch }))

  const value = useMemo(
    () => ({
      ref: initial.ref,
      status: initial.status,
      bookingGroupId: initial.bookingGroupId,
      customer,
      details,
      guests,
      excludeBookingIds,
      patchDetails,
      setMode,
      setCategory,
      setDuration,
      setPick,
      setCombo,
      updateSlot,
      toggleAddon,
      setTherapistMode,
      setTherapist,
      setGuestDate,
      setGuestTime,
    }),
    [
      initial.ref,
      initial.status,
      initial.bookingGroupId,
      customer,
      details,
      guests,
      excludeBookingIds,
      patchDetails,
      setMode,
      setCategory,
      setDuration,
      setPick,
      setCombo,
      updateSlot,
      toggleAddon,
      setTherapistMode,
      setTherapist,
      setGuestDate,
      setGuestTime,
    ],
  )

  return <AdminEditContext.Provider value={value}>{children}</AdminEditContext.Provider>
}

export function useAdminEdit() {
  const ctx = useContext(AdminEditContext)
  if (!ctx) throw new Error('useAdminEdit must be used within AdminEditProvider')
  return ctx
}
