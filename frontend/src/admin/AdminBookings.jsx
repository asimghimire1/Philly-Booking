import { useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminData } from './data.jsx'
import BookingDetailModal from './BookingDetailModal.jsx'
import { Card, PageHeading, StatusBadge, PaymentBadge, Initials, fieldCls, fmtDate, money } from './ui.jsx'

const PAGE_SIZE = 15

function refNum(ref) {
  return parseInt((ref || '').replace('PAW-', ''), 10) || 0
}

// Get current datetime as ISO string for comparison
function nowIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}T${h}:${min}`
}

const FILTERS = ['all', 'upcoming', 'unresolved', 'completed', 'cancelled']

export default function AdminBookings() {
  const { bookings, setBookingStatus } = useAdminData()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const headingRef = useRef(null)

  const now = nowIso()

  // Reset load count when filter or search changes
  useEffect(() => { setDisplayCount(PAGE_SIZE) }, [filter, query])

  const counts = useMemo(() => {
    const c = { all: bookings.length, upcoming: 0, unresolved: 0, completed: 0, cancelled: 0 }
    for (const b of bookings) {
      // Only count upcoming if booking time is in the future
      if (b.status === 'upcoming' && b.date + 'T' + b.time >= now) {
        c.upcoming++
      }
      // Unresolved: past time but not completed
      if (b.status !== 'completed' && b.status !== 'cancelled' && b.date + 'T' + b.time < now) {
        c.unresolved++
      }
      if (b.status === 'completed') c.completed++
      if (b.status === 'cancelled') c.cancelled++
    }
    return c
  }, [bookings, now])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bookings
      .filter((b) => {
        if (filter === 'all') return true
        if (filter === 'upcoming') return b.status === 'upcoming' && b.date + 'T' + b.time >= now
        if (filter === 'unresolved') return b.status !== 'completed' && b.status !== 'cancelled' && b.date + 'T' + b.time < now
        return b.status === filter
      })
      .filter((b) =>
        !q
          ? true
          : b.customer.name.toLowerCase().includes(q) ||
            b.ref.toLowerCase().includes(q) ||
            b.customer.phone.includes(q) ||
            b.customer.email.toLowerCase().includes(q),
      )
      .sort((a, b) => refNum(b.ref) - refNum(a.ref))
  }, [bookings, filter, query, now])

  const paged = useMemo(() => filtered.slice(0, displayCount), [filtered, displayCount])
  const hasMore = paged.length < filtered.length

  const open = bookings.find((b) => b.id === openId)
  const total = (b) => b.servicesTotal + b.addonsTotal + b.tip

  return (
    <div className="animate-step">
      <div ref={headingRef}>
        <PageHeading title="Bookings" subtitle="View and manage all appointments" />
      </div>

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
      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">No bookings match.</Card>
      ) : (
        <div className="space-y-3">
          {paged.map((b) => (
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
                    {b.party.length > 1 ? `${b.party.length} guests` : b.party[0]?.service || 'No service'}
                  </p>
                </div>
                <div className="hidden text-right sm:flex sm:flex-col sm:items-end">
                  <p className="font-semibold text-navy">{money(total(b))}</p>
                  <span className="mt-1">
                    <PaymentBadge payment={b.payment} paymentStatus={b.paymentStatus} />
                  </span>
                </div>
                <StatusBadge status={b.status} date={b.date} time={b.time} />
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

      {/* Load more / Show less — uses stable cursor from top, so new
          bookings arriving via polling never cause duplicates or gaps. */}
      {filtered.length > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {displayCount > PAGE_SIZE && (
            <button
              type="button"
              onClick={() => { setDisplayCount((c) => Math.max(PAGE_SIZE, c - PAGE_SIZE)); headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-navy"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Show less
            </button>
          )}
          <span className="text-xs text-slate-400">
            {paged.length} of {filtered.length}
          </span>
          {hasMore && (
            <button
              type="button"
              onClick={() => { setDisplayCount((c) => c + PAGE_SIZE) }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-navy"
            >
              Load more
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      )}

      <BookingDetailModal
        booking={open}
        onClose={() => setOpenId(null)}
        onSetStatus={setBookingStatus}
        onEdit={(bookingId) => {
          setOpenId(null)
          navigate(`/admin/bookings/${bookingId}/edit`)
        }}
      />
    </div>
  )
}
