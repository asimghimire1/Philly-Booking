import { createContext, useContext, useEffect, useState, useCallback } from 'react'


const AdminDataContext = createContext(null)

export const WEEK = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]


export function AdminDataProvider({ children }) {
  const [bookings, setBookings] = useState([])
  const [staff, setStaff] = useState([])
  const [hours, setHours] = useState({})
  const [closures, setClosures] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${API_URL}/api/admin/data`)
      const data = await response.json()
      
      setBookings(data.bookings || [])
      setStaff(data.staff || [])
      
      if (data.hours) {
        const hoursMap = {}
        data.hours.forEach((h) => {
          hoursMap[h.day] = { open: h.open, start: h.start_time, end: h.end_time }
        })
        setHours(hoursMap)
      }
      
      if (data.closures) {
        setClosures(data.closures.map((c) => c.date))
      }
    } catch (err) {
      console.error('Failed to load admin data:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const apiFetch = async (url, options = {}) => {
    const API_URL = import.meta.env.VITE_API_URL || ''
    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!res.ok) throw new Error('API Request Failed')
    return res.json()
  }

  const actions = {
    // bookings
    setBookingStatus: async (id, status) => {
      try {
        await apiFetch(`/api/admin/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
      } catch (err) {
        console.error(err)
      }
    },

    // staff
    addStaff: async ({ name, gender, role }) => {
      const id = `st_${Date.now()}`
      try {
        await apiFetch('/api/admin/staff', { method: 'POST', body: JSON.stringify({ id, name: name.trim(), gender, role: role.trim(), active: true }) })
        setStaff((prev) => [...prev, { id, name, gender, role, active: true }])
      } catch (err) {
        console.error(err)
      }
    },
    removeStaff: async (id) => {
      try {
        await apiFetch(`/api/admin/staff/${id}`, { method: 'DELETE' })
        setStaff((prev) => prev.filter((m) => m.id !== id))
      } catch (err) {
        console.error(err)
      }
    },
    toggleStaff: async (id) => {
      const member = staff.find((m) => m.id === id)
      if (!member) return
      try {
        await apiFetch(`/api/admin/staff/${id}/active`, { method: 'PUT', body: JSON.stringify({ active: !member.active }) })
        setStaff((prev) => prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)))
      } catch (err) {
        console.error(err)
      }
    },

    updateStaff: async (id, { name, gender, role }) => {
      try {
        await apiFetch(`/api/admin/staff/${id}`, { method: 'PUT', body: JSON.stringify({ name: name.trim(), gender, role: role.trim() }) })
        setStaff((prev) => prev.map((m) => (m.id === id ? { ...m, name, gender, role } : m)))
      } catch (err) {
        console.error(err)
      }
    },

    // availability
    setDayOpen: async (day, open) => {
      try {
        await apiFetch(`/api/admin/hours/${day}/open`, { method: 'PUT', body: JSON.stringify({ open }) })
        setHours((prev) => ({ ...prev, [day]: { ...prev[day], open } }))
      } catch (err) {
        console.error(err)
      }
    },
    setDayHours: async (day, field, value) => {
      try {
        await apiFetch(`/api/admin/hours/${day}/${field}`, { method: 'PUT', body: JSON.stringify({ value }) })
        setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
      } catch (err) {
        console.error(err)
      }
    },
    addClosure: async (date) => {
      if (!date || closures.includes(date)) return
      try {
        await apiFetch('/api/admin/closures', { method: 'POST', body: JSON.stringify({ date }) })
        setClosures((prev) => [...prev, date].sort())
      } catch (err) {
        console.error(err)
      }
    },
    removeClosure: async (date) => {
      try {
        await apiFetch(`/api/admin/closures/${date}`, { method: 'DELETE' })
        setClosures((prev) => prev.filter((d) => d !== date))
      } catch (err) {
        console.error(err)
      }
    },

    refresh: loadAll,
  }

  // Reshape flat columns back into the nested shape the existing admin
  // components expect (matches the old seed() shape from localStorage days).
  const reshapedBookings = bookings.map((b) => ({
    id: b.id,
    ref: b.ref,
    status: b.status,
    customer: { name: b.customer_name, phone: b.customer_phone, email: b.customer_email },
    date: b.booking_date,
    time: b.booking_time,
    durationMin: b.duration_min,
    party: b.party,
    servicesTotal: Number(b.services_total),
    addonsTotal: Number(b.addons_total),
    tip: Number(b.tip),
    payment: b.payment,
    note: b.note,
    createdAt: b.created_at,
  }))

  const value = {
    bookings: reshapedBookings,
    staff,
    availability: { hours, closures },
    loading,
    ...actions,
  }

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext)
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider')
  return ctx
}