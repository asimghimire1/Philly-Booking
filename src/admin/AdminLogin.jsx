import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import logo from '../assets/Images/logo.png'
import { useAdminAuth } from './auth.jsx'
import { fieldCls } from './ui.jsx'

export default function AdminLogin() {
  const { user, signIn, pending } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Already signed in — go straight to the dashboard.
  if (user) return <Navigate to="/admin" replace />

  const from = location.state?.from?.pathname || '/admin'

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Sign in failed.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
      <div className="animate-step w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="" className="h-12 w-12" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-navy">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">Pain Away of Philly</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">Email</span>
            <input
              type="email"
              className={fieldCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@painawayphilly.com"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">Password</span>
            <input
              type="password"
              className={fieldCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3 font-semibold text-white shadow-sm transition-all duration-200 ${
              pending
                ? 'cursor-not-allowed bg-slate-300'
                : 'bg-gradient-to-r from-navy to-teal hover:shadow-md active:scale-[0.98]'
            }`}
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Restricted access · authorized staff only
          </p>
        </form>
      </div>
    </div>
  )
}
