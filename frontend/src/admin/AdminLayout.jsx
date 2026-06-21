import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/Images/logo.png'
import { useAdminAuth } from './auth.jsx'

const NAV = [
  { to: '/admin', end: true, label: 'Overview', icon: 'M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z' },
  { to: '/admin/calendar', label: 'Calendar', icon: 'M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z M4 10h16 M9 10v11 M14 10v11' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'M7 11h10M7 15h6M5 4h14a1 1 0 011 1v14l-3-2-3 2-3-2-3 2V5a1 1 0 011-1z' },
  { to: '/admin/availability', label: 'Availability', icon: 'M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z' },
  { to: '/admin/staff', label: 'Staff', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 20a8 8 0 0116 0' },
]

function NavItem({ to, end, label, icon, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-teal/15 text-teal'
            : 'text-slate-600 hover:bg-slate-100 hover:text-navy'
        }`
      }
    >
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d={icon} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </NavLink>
  )
}

export default function AdminLayout() {
  const { user, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the drawer on navigation, and lock scroll + allow Escape while open.
  useEffect(() => setMenuOpen(false), [pathname])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const onSignOut = () => {
    signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="-ml-1 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy lg:hidden"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <img src={logo} alt="" className="h-8 w-8 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-sm font-semibold text-navy">
                Pain Away · Admin
              </p>
              <p className="truncate text-xs text-slate-400">Practice dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-right text-xs text-slate-500 lg:block">
              <span className="block font-medium text-navy">{user?.name}</span>
              <span className="block truncate">{user?.email}</span>
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-navy lg:inline-flex"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M15 12H4m0 0l4-4m-4 4l4 4M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer: backdrop + sliding panel (hidden on desktop). */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[80%] transform flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <img src={logo} alt="" className="h-8 w-8" />
            <p className="truncate font-display text-sm font-semibold text-navy">
              Pain Away · Admin
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto p-3">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} onClick={() => setMenuOpen(false)} />
          ))}
        </nav>
        {user && (
          <div className="mt-auto border-t border-slate-200 p-3">
            <div className="px-1 pb-2 text-xs text-slate-500">
              <p className="font-medium text-navy">{user.name}</p>
              <p className="truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-navy"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M15 12H4m0 0l4-4m-4 4l4 4M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </aside>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        {/* Persistent sidebar — desktop only. */}
        <aside className="hidden min-w-0 lg:block lg:py-1">
          <nav className="flex flex-col gap-2">
            {NAV.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
