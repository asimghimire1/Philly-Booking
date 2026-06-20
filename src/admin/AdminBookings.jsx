import { useMemo, useState } from 'react'
import { useAdminData } from './data.jsx'
import BookingDetailModal from './BookingDetailModal.jsx'
import { Card, PageHeading, StatusBadge, Initials, fieldCls, fmtDate, money } from './ui.jsx'

const FILTERS = ['all', 'upcoming', 'completed', 'cancelled']

export default function AdminBookings() {
  const { bookings, setBookingStatus } = useAdminData()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)

  const counts = useMemo(() => {
    const c = { all: bookings.length, upcoming: 0, completed: 0, cancelled: 0 }
    for (const b of bookings) c[b.status]++
    return c
  }, [bookings])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bookings
      .filter((b) => (filter === 'all' ? true : b.status === filter))
      .filter((b) =>
        !q
          ? true
          : b.customer.name.toLowerCase().includes(q) ||
            b.ref.toLowerCase().includes(q) ||
            b.customer.phone.includes(q) ||
            b.customer.email.toLowerCase().includes(q),
      )
      .sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1))
  }, [bookings, filter, query])

  const open = bookings.find((b) => b.id === openId)
  const total = (b) => b.servicesTotal + b.addonsTotal + b.tip

  return (
    <div className="animate-step">
      <PageHeading title="Bookings" subtitle="View and manage all appointments" />

      {/* Filters + search */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-navy text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-navy'
              }`}
            >
              {f}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  filter === f ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
            <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            className={`${fieldCls} pl-9`}
            placeholder="Search name, ref, phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">No bookings match.</Card>
      ) : (
        <div className="space-y-3">
          {visible.map((b) => (
            <Card key={b.id} className="p-4 transition-shadow hover:shadow-sm">
              <div className="flex items-center gap-4">
                <Initials name={b.customer.name} className="h-11 w-11" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-navy">{b.customer.name}</p>
                    <span className="hidden text-xs text-slate-400 sm:inline">{b.ref}</span>
                  </div>
                  <p className="truncate text-sm text-slate-500">
                    {fmtDate(b.date)} · {b.time} ·{' '}
                    {b.party.length > 1 ? `${b.party.length} guests` : b.party[0].service}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="font-semibold text-navy">{money(total(b))}</p>
                  <p className="text-xs capitalize text-slate-400">{b.payment}</p>
                </div>
                <StatusBadge status={b.status} />
                <button
                  type="button"
                  onClick={() => setOpenId(b.id)}
                  className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
                  aria-label="View details"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BookingDetailModal
        booking={open}
        onClose={() => setOpenId(null)}
        onSetStatus={setBookingStatus}
      />
    </div>
  )
}
