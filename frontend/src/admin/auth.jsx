import { createContext, useCallback, useContext, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const SESSION_KEY = 'paw.admin.session'

import { supabase } from '../lib/supabaseClient.js'

async function signInAdapter(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) throw new Error('Invalid email or password.')
  return {
    email: data.user.email,
    name: data.user.user_metadata?.name || 'Admin',
  }
}

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

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
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
