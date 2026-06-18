import { createContext, useCallback, useContext, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ADMIN_USERS } from './config.js'

const SESSION_KEY = 'paw.admin.session'

// ── SWAP SEAM ───────────────────────────────────────────────────────────────
// This is the ONLY function to replace when a backend / auth provider exists.
// It must take an email + password and resolve to a user object, or throw on
// failure. Everything else in the app (session handling, route guards, the
// login screen, the dashboard) stays exactly the same.
//
//   Supabase example:
//     const { data, error } =
//       await supabase.auth.signInWithPassword({ email, password })
//     if (error) throw new Error(error.message)
//     return { email: data.user.email, name: data.user.user_metadata.name }
//
// Until then, this checks the placeholder credentials in config.js.
async function signInAdapter(email, password) {
  await new Promise((r) => setTimeout(r, 450)) // mimic a network round-trip
  const match = ADMIN_USERS.find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.password === password,
  )
  if (!match) throw new Error('Invalid email or password.')
  return { email: match.email, name: match.name }
}
// ──────────────────────────────────────────────────────────────────────────────

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  // Session lives in sessionStorage, so it clears when the tab closes.
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null
    } catch {
      return null
    }
  })
  const [pending, setPending] = useState(false)

  const signIn = useCallback(async (email, password) => {
    setPending(true)
    try {
      const u = await signInAdapter(email, password)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
      setUser(u)
      return u
    } finally {
      setPending(false)
    }
  }, [])

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ user, pending, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}

// Route guard: bounce to the login screen, remembering where you were headed.
export function RequireAdmin({ children }) {
  const { user } = useAdminAuth()
  const location = useLocation()
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  return children
}
