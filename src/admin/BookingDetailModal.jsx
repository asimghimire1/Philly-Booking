import Modal from '../components/booking/Modal.jsx'
import { StatusBadge, Initials, fmtDate, money } from './ui.jsx'

const total = (b) => b.servicesTotal + b.addonsTotal + b.tip

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

// The full booking detail dialog, shared by the Bookings list and the Calendar.
export default function BookingDetailModal({ booking, onClose, onSetStatus }) {
  return (
    <Modal open={!!booking} onClose={onClose}>
      {booking && (
        <>
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div className="flex min-w-0 items-center gap-3">
              <Initials name={booking.customer.name} className="h-12 w-12" />
              <div className="min-w-0">
                <h2 className="truncate font-display text-xl font-semibold text-navy">
                  {booking.customer.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {booking.ref} · booked {fmtDate(booking.createdAt)}
                </p>
              </div>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Appointment
              </h3>
              <DetailRow label="Date" value={fmtDate(booking.date)} />
              <DetailRow label="Time" value={booking.time} />
              <DetailRow label="Payment" value={<span className="capitalize">{booking.payment}</span>} />
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Contact
              </h3>
              <DetailRow label="Phone" value={booking.customer.phone} />
              <DetailRow label="Email" value={booking.customer.email} />
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Party ({booking.party.length})
              </h3>
              <div className="space-y-2">
                {booking.party.map((p, i) => (
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

            {booking.note && (
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Note
                </h3>
                <p className="rounded-xl bg-mint p-3 text-sm text-slate-600">{booking.note}</p>
              </section>
            )}

            <section className="space-y-2 border-t border-slate-100 pt-4">
              <DetailRow label="Services" value={money(booking.servicesTotal)} />
              <DetailRow label="Add-ons" value={money(booking.addonsTotal)} />
              <DetailRow label="Tip" value={money(booking.tip)} />
              <div className="flex justify-between pt-1 text-base font-semibold text-navy">
                <span>Total</span>
                <span>{money(total(booking))}</span>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
            <StatusActions booking={booking} onSet={onSetStatus} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:text-navy"
            >
              Close
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
