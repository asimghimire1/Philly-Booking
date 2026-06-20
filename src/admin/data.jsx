import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { therapists } from '../data/therapists.js'

const STORE_KEY = 'paw.admin.store'
const SCHEMA = 3 // bump to discard older seed shapes on load

// Days are stored Monday-first to match how the schedule reads.
export const WEEK = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

// ISO yyyy-mm-dd offset from today (local).
function iso(offsetDays = 0) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// ── Seed data — stands in for what a backend would serve. Bookings here are
//    sample records; real submissions flow in once the booking form is wired
//    to the backend. ──────────────────────────────────────────────────────
function seed() {
  return {
    schema: SCHEMA,
    bookings: [
      {
        id: 'b1', ref: 'PAW-1042', status: 'upcoming',
        customer: { name: 'Olivia Chen', phone: '(215) 555-0142', email: 'olivia.chen@gmail.com' },
        date: iso(0), time: '10:30 AM', durationMin: 60,
        party: [{ name: 'Olivia Chen', service: 'Tui-Na · 1 hr', therapist: 'David Xia', addons: ['Hot Stones'] }],
        servicesTotal: 80, addonsTotal: 0, tip: 20, payment: 'prepay',
        note: 'Lower-back tension, prefers firm pressure.', createdAt: iso(-3),
      },
      {
        id: 'b2', ref: 'PAW-1043', status: 'upcoming',
        customer: { name: 'Marcus Reed', phone: '(267) 555-0199', email: 'marcus.reed@outlook.com' },
        date: iso(0), time: '3:00 PM', durationMin: 90,
        party: [
          { name: 'Marcus Reed', service: 'Deep Tissue · 1.5 hr', therapist: 'Kevin An', addons: ['Fire Cupping'] },
          { name: 'Guest 2', service: 'Foot Reflexology · 1 hr', therapist: 'No preference', addons: [] },
        ],
        servicesTotal: 200, addonsTotal: 40, tip: 0, payment: 'visit',
        note: '', createdAt: iso(-2),
      },
      {
        id: 'b3', ref: 'PAW-1044', status: 'upcoming',
        customer: { name: 'Priya Nair', phone: '(215) 555-0167', email: 'priya.nair@gmail.com' },
        date: iso(1), time: '12:00 PM', durationMin: 90,
        party: [{ name: 'Priya Nair', service: '3-service combo', therapist: 'Lucy Gao', addons: [] }],
        servicesTotal: 120, addonsTotal: 0, tip: 30, payment: 'prepay',
        note: 'First visit.', createdAt: iso(-1),
      },
      {
        id: 'b4', ref: 'PAW-1039', status: 'completed',
        customer: { name: 'James Whitfield', phone: '(484) 555-0121', email: 'jwhit@proton.me' },
        date: iso(-2), time: '4:30 PM', durationMin: 60,
        party: [{ name: 'James Whitfield', service: 'Swedish · 1 hr', therapist: 'Sally Wang', addons: ['Hot Stones'] }],
        servicesTotal: 80, addonsTotal: 0, tip: 16, payment: 'prepay',
        note: '', createdAt: iso(-6),
      },
      {
        id: 'b5', ref: 'PAW-1041', status: 'cancelled',
        customer: { name: 'Dana Lopez', phone: '(215) 555-0188', email: 'dana.lopez@gmail.com' },
        date: iso(-1), time: '6:00 PM', durationMin: 30,
        party: [{ name: 'Dana Lopez', service: 'Gua Sha · 20 min', therapist: 'Yo-Yo Liu', addons: [] }],
        servicesTotal: 40, addonsTotal: 0, tip: 0, payment: 'visit',
        note: 'Cancelled by customer.', createdAt: iso(-4),
      },
      {
        id: 'b6', ref: 'PAW-1045', status: 'upcoming',
        customer: { name: 'Sophie Müller', phone: '(267) 555-0150', email: 'sophie.m@gmail.com' },
        date: iso(3), time: '1:30 PM', durationMin: 60,
        party: [{ name: 'Sophie Müller', service: 'Prenatal · 1 hr', therapist: 'Female therapist', addons: [] }],
        servicesTotal: 80, addonsTotal: 0, tip: 20, payment: 'prepay',
        note: '2nd trimester — pregnancy-safe only.', createdAt: iso(0),
      },
    ],
    staff: therapists.map((th) => ({
      id: th.id,
      name: th.name,
      gender: th.gender,
      role: th.descEn,
      active: true,
    })),
    availability: {
      hours: {
        mon: { open: true, start: '10:00', end: '20:00' },
        tue: { open: true, start: '10:00', end: '20:00' },
        wed: { open: true, start: '10:00', end: '20:00' },
        thu: { open: true, start: '10:00', end: '20:00' },
        fri: { open: true, start: '10:00', end: '21:00' },
        sat: { open: true, start: '10:00', end: '21:00' },
        sun: { open: true, start: '11:00', end: '18:00' },
      },
      closures: [iso(9)], // a sample upcoming day off
    },
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.schema === SCHEMA) return parsed
    }
  } catch {
    /* fall through to seed */
  }
  const fresh = seed()
  localStorage.setItem(STORE_KEY, JSON.stringify(fresh))
  return fresh
}

const AdminDataContext = createContext(null)

export function AdminDataProvider({ children }) {
  const [store, setStore] = useState(load)

  // Persist on every change so edits survive a refresh.
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store))
  }, [store])

  const actions = useMemo(
    () => ({
      // bookings
      setBookingStatus: (id, status) =>
        setStore((s) => ({
          ...s,
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
        })),

      // staff
      addStaff: ({ name, gender, role }) =>
        setStore((s) => ({
          ...s,
          staff: [
            ...s.staff,
            { id: `st_${Date.now()}`, name: name.trim(), gender, role: role.trim(), active: true },
          ],
        })),
      removeStaff: (id) =>
        setStore((s) => ({ ...s, staff: s.staff.filter((m) => m.id !== id) })),
      toggleStaff: (id) =>
        setStore((s) => ({
          ...s,
          staff: s.staff.map((m) => (m.id === id ? { ...m, active: !m.active } : m)),
        })),

      // availability
      setDayOpen: (day, open) =>
        setStore((s) => ({
          ...s,
          availability: {
            ...s.availability,
            hours: { ...s.availability.hours, [day]: { ...s.availability.hours[day], open } },
          },
        })),
      setDayHours: (day, field, value) =>
        setStore((s) => ({
          ...s,
          availability: {
            ...s.availability,
            hours: { ...s.availability.hours, [day]: { ...s.availability.hours[day], [field]: value } },
          },
        })),
      addClosure: (date) =>
        setStore((s) =>
          !date || s.availability.closures.includes(date)
            ? s
            : {
                ...s,
                availability: {
                  ...s.availability,
                  closures: [...s.availability.closures, date].sort(),
                },
              },
        ),
      removeClosure: (date) =>
        setStore((s) => ({
          ...s,
          availability: {
            ...s.availability,
            closures: s.availability.closures.filter((d) => d !== date),
          },
        })),

      resetDemoData: () => setStore(seed()),
    }),
    [],
  )

  const value = useMemo(() => ({ ...store, ...actions }), [store, actions])
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext)
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider')
  return ctx
}
