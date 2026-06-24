import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAdminData } from './data.jsx'
import { Card, PageHeading, StatCard, StatusBadge, fmtDate, money } from './ui.jsx'

function todayIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// Get current datetime for comparison
function nowIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}T${h}:${min}`
}

export default function AdminOverview() {
  const { bookings, staff } = useAdminData()
  const today = todayIso()
  const now = nowIso()

  const stats = useMemo(() => {
    const upcoming = bookings.filter((b) => b.status === 'upcoming')
    const todays = upcoming
      .filter((b) => b.date === today)
      .sort((a, b) => a.time.localeCompare(b.time))
    // Unresolved: past time but not completed
    const unresolved = bookings.filter(
      (b) => b.status !== 'completed' && b.status !== 'cancelled' && b.date + 'T' + b.time < now
    )
    // Revenue: only completed bookings
    const revenue = bookings
      .filter((b) => b.status === 'completed')
      .reduce((s, b) => s + b.servicesTotal + b.addonsTotal + b.tip, 0)
    return {
      todays,
      upcomingCount: upcoming.length,
      unresolvedCount: unresolved.length,
      activeStaff: staff.filter((s) => s.active).length,
      revenue,
    }
  }, [bookings, staff, today, now])

  const icon = (d) => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  return (
    <div className="animate-step">
      <PageHeading title="Overview" subtitle="Today at a glance" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Today's appointments"
          value={stats.todays.length}
          sublabel={fmtDate(today)}
          tone="teal"
          icon={icon('M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z')}
        />
        <StatCard
          label="Upcoming bookings"
          value={stats.upcomingCount}
          sublabel="Not yet completed"
          tone="navy"
          icon={icon('M5 4h14a1 1 0 011 1v14l-3-2-3 2-3-2-3 2V5a1 1 0 011-1z')}
        />
        <StatCard
          label="Unresolved"
          value={stats.unresolvedCount}
          sublabel="Past appointments"
          tone="amber"
          icon={icon('M12 8v4l3 3M12 21a9 9 0 100-18 9 9 0 000 18z')}
        />
        <StatCard
          label="Active staff"
          value={stats.activeStaff}
          sublabel={`${staff.length} total`}
          tone="amber"
          icon={icon('M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 20a8 8 0 0116 0')}
        />
        <StatCard
          label="Booked revenue"
          value={money(stats.revenue)}
          sublabel="Completed only"
          tone="teal"
          icon={icon('M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6')}
        />
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">Today's schedule</h2>
          <Link to="/admin/bookings" className="text-sm font-medium text-teal hover:underline">
            View all bookings →
          </Link>
        </div>

        {stats.todays.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No appointments scheduled for today.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {stats.todays.map((b) => (
              <li key={b.id} className="flex items-center gap-4 py-3">
                <span className="w-20 shrink-0 text-sm font-semibold text-navy">{b.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-navy">{b.customer.name}</p>
                  <p className="truncate text-sm text-slate-500">
                    {b.party.map((p) => p.service).join(' · ')}
                  </p>
                </div>
                <StatusBadge status={b.status} date={b.date} time={b.time} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
