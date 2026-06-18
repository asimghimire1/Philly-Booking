import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import logo from '../assets/Images/logo.png'
import { useAdminAuth } from './auth.jsx'

const NAV = [
  { to: '/admin', end: true, label: 'Overview', icon: 'M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'M7 11h10M7 15h6M5 4h14a1 1 0 011 1v14l-3-2-3 2-3-2-3 2V5a1 1 0 011-1z' },
  { to: '/admin/availability', label: 'Availability', icon: 'M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z' },
  { to: '/admin/staff', label: 'Staff', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 20a8 8 0 0116 0' },
]

function NavItem({ to, end, label, icon }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
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

  const onSignOut = () => {
    signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <img src={logo} alt="" className="h-8 w-8" />
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-sm font-semibold text-navy">
                Pain Away · Admin
              </p>
              <p className="truncate text-xs text-slate-400">Practice dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-right text-xs text-slate-500 sm:block">
              <span className="block font-medium text-navy">{user?.name}</span>
              <span className="block truncate">{user?.email}</span>
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-navy"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M15 12H4m0 0l4-4m-4 4l4 4M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar on desktop; wrapping pill nav on mobile. min-w-0 keeps this
            grid item from expanding the column to its content width. */}
        <aside className="min-w-0 lg:py-1">
          <nav className="flex flex-wrap gap-2 lg:flex-col">
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
