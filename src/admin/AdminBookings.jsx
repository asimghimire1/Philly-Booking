import { useMemo, useState } from 'react'
import Modal from '../components/booking/Modal.jsx'
import { useAdminData } from './data.jsx'
import {
  Card,
  PageHeading,
  StatusBadge,
  Initials,
  fieldCls,
  fmtDate,
  money,
} from './ui.jsx'

const FILTERS = ['all', 'upcoming', 'completed', 'cancelled']

function StatusActions({ booking, onSet }) {
  const btn =
    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed'
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={booking.status === 'completed'}
        onClick={() => onSet(booking.id, 'completed')}
        className={`${btn} ${
          booking.status === 'completed'
            ? 'bg-slate-100 text-slate-400'
            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
        }`}
      >
        Mark completed
      </button>
      {booking.status === 'cancelled' ? (
        <button
          type="button"
          onClick={() => onSet(booking.id, 'upcoming')}
          className={`${btn} bg-teal/10 text-teal hover:bg-teal/20`}
        >
          Reopen
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onSet(booking.id, 'cancelled')}
          className={`${btn} bg-rose-100 text-rose-600 hover:bg-rose-200`}
        >
          Cancel
        </button>
      )}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-navy">{value}</span>
    </div>
  )
}

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

      {/* Detail modal */}
      <Modal open={!!open} onClose={() => setOpenId(null)}>
        {open && (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="flex min-w-0 items-center gap-3">
                <Initials name={open.customer.name} className="h-12 w-12" />
                <div className="min-w-0">
                  <h2 className="truncate font-display text-xl font-semibold text-navy">
                    {open.customer.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {open.ref} · booked {fmtDate(open.createdAt)}
                  </p>
                </div>
              </div>
              <StatusBadge status={open.status} />
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Appointment
                </h3>
                <DetailRow label="Date" value={fmtDate(open.date)} />
                <DetailRow label="Time" value={open.time} />
                <DetailRow label="Payment" value={<span className="capitalize">{open.payment}</span>} />
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Contact
                </h3>
                <DetailRow label="Phone" value={open.customer.phone} />
                <DetailRow label="Email" value={open.customer.email} />
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Party ({open.party.length})
                </h3>
                <div className="space-y-2">
                  {open.party.map((p, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                      <p className="font-medium text-navy">{p.name}</p>
                      <p className="text-slate-500">{p.service}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Therapist: {p.therapist}
                        {p.addons?.length ? ` · Add-ons: ${p.addons.join(', ')}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {open.note && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Note
                  </h3>
                  <p className="rounded-xl bg-mint p-3 text-sm text-slate-600">{open.note}</p>
                </section>
              )}

              <section className="space-y-2 border-t border-slate-100 pt-4">
                <DetailRow label="Services" value={money(open.servicesTotal)} />
                <DetailRow label="Add-ons" value={money(open.addonsTotal)} />
                <DetailRow label="Tip" value={money(open.tip)} />
                <div className="flex justify-between pt-1 text-base font-semibold text-navy">
                  <span>Total</span>
                  <span>{money(total(open))}</span>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
              <StatusActions booking={open} onSet={setBookingStatus} />
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:text-navy"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
