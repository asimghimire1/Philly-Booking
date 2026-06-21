import { useAdminData, WEEK } from './data.jsx'
import { Card, PageHeading, fieldCls, fmtDate } from './ui.jsx'
import ClosedDatePicker from './ClosedDatePicker.jsx'

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 ${
        on ? 'bg-teal' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ${
          on ? 'translate-x-[1.375rem]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function AdminAvailability() {
  const { availability, loading, setDayOpen, setDayHours, addClosure, removeClosure } = useAdminData()

  // Don't render until hours data has loaded from the backend
  if (loading || Object.keys(availability.hours).length === 0) {
    return (
      <div className="animate-step flex items-center justify-center py-24 text-slate-400 text-sm">
        Loading availability…
      </div>
    )
  }

  return (
    <div className="animate-step">
      <PageHeading
        title="Availability"
        subtitle="Set weekly opening hours and block off specific dates"
      />

      <p className="mb-5 flex items-start gap-2 rounded-xl bg-mint px-4 py-3 text-sm text-slate-600">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v4l2.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Changes save automatically. Once the backend is connected, these hours
        drive the time slots customers can book.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Weekly hours */}
        <Card className="divide-y divide-slate-100 p-2">
          {WEEK.map(({ key, label }) => {
            const day = availability.hours[key]
            return (
              <div key={key} className="flex flex-wrap items-center gap-3 px-3 py-3.5">
                <div className="flex w-40 shrink-0 items-center gap-3">
                  <Toggle on={day.open} onChange={(v) => setDayOpen(key, v)} />
                  <span className={`whitespace-nowrap text-sm font-medium ${day.open ? 'text-navy' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
                {day.open ? (
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="time"
                      value={day.start}
                      onChange={(e) => setDayHours(key, 'start', e.target.value)}
                      className={`${fieldCls} w-32`}
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={day.end}
                      onChange={(e) => setDayHours(key, 'end', e.target.value)}
                      className={`${fieldCls} w-32`}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">Closed</span>
                )}
              </div>
            )
          })}
        </Card>

        {/* Closed dates */}
        <Card className="h-fit p-5">
          <h2 className="font-display text-lg font-semibold text-navy">Closed dates</h2>
          <p className="mt-1 text-sm text-slate-500">Holidays or one-off days off.</p>

          <div className="mt-4">
            <ClosedDatePicker closures={availability.closures} onAdd={addClosure} />
          </div>

          <div className="mt-4 space-y-2">
            {availability.closures.length === 0 ? (
              <p className="text-sm text-slate-400">No closed dates.</p>
            ) : (
              availability.closures.map((d) => (
                <div
                  key={d}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-navy">{fmtDate(d)}</span>
                  <button
                    type="button"
                    onClick={() => removeClosure(d)}
                    aria-label={`Remove ${d}`}
                    className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-rose-500"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
