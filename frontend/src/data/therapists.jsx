import { createContext, useContext, useState, useEffect, useCallback } from 'react'


// Legacy fallback in case Supabase is down (don't ship to prod with this as primary)
const FALLBACK_THERAPISTS = [
  { id: 'th_david', name: 'David Xia', gender: 'male', role: 'Tui-Na specialist' },
  { id: 'th_kevin', name: 'Kevin An', gender: 'male', role: 'Deep Tissue specialist' },
  { id: 'th_lucy', name: 'Lucy Gao', gender: 'female', role: 'Combo specialist' },
  { id: 'th_sally', name: 'Sally Wang', gender: 'female', role: 'Swedish specialist' },
  { id: 'th_yoyo', name: 'Yo-Yo Liuu', gender: 'female', role: 'Traditional specialty' },
]

const TherapistContext = createContext(null)

export function TherapistProvider({ children }) {
  const [therapists, setTherapists] = useState(FALLBACK_THERAPISTS)
  const [loading, setLoading] = useState(true)

  const loadTherapists = useCallback(async () => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${API_URL}/api/staff`)
      if (!response.ok) throw new Error('Failed to load')
      const { data } = await response.json()
      setTherapists(data.map((s) => ({
        id: s.id,
        name: s.name,
        gender: s.gender,
        role: s.role,
        descEn: s.role,   // role is English — used for English display
        descZh: s.role,   // fallback until a descZh DB column is added
      })))
    } catch (err) {
      console.error('Error loading therapists:', err)
      setTherapists(FALLBACK_THERAPISTS)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTherapists()
    const onFocus = () => loadTherapists()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadTherapists()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    const timer = setInterval(loadTherapists, 60000)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      clearInterval(timer)
    }
  }, [])

  return <TherapistContext.Provider value={{ therapists, loading }}>{children}</TherapistContext.Provider>
}

export function useTherapists() {
  const ctx = useContext(TherapistContext)
  if (!ctx) throw new Error('useTherapists must be used within TherapistProvider')
  return ctx
}

export function findTherapistById(therapists, id) {
  if (!id) return null
  const liveMatch = Array.isArray(therapists) ? therapists.find((th) => th.id === id) : null
  return liveMatch || FALLBACK_THERAPISTS.find((th) => th.id === id) || null
}

export const getTherapist = (id) => {
  // This is for synchronous access (bookings already loaded).
  // Falls back to a lookup via context if needed.
  return findTherapistById(FALLBACK_THERAPISTS, id) || { id, name: 'Unknown', gender: 'male', role: '' }
}

// Resolve a guest's preference to an actual practitioner for display — even
// "no preference" shows the matched practitioner we'd assign (varied by index).
export function assignedTherapist(pref, therapists = FALLBACK_THERAPISTS, index = 0) {
  if (pref?.therapistId) return therapists.find((t) => t.id === pref.therapistId)
  if (pref?.mode === 'female' || pref?.mode === 'male') {
    const pool = therapists.filter((th) => th.gender === pref.mode)
    return pool[index % pool.length] ?? pool[0]
  }
  return therapists[index % therapists.length]
}

// Resolves a preference to a display token: a practitioner's name when one is
// picked, the gender ('female'/'male'), or 'none' for no preference / no pick.
export function therapistLabel(pref) {
  if (pref?.therapistId) return getTherapist(pref.therapistId)?.name ?? 'none'
  if (pref?.mode === 'female' || pref?.mode === 'male') return pref.mode
  return 'none'
}