import { useEffect, useRef, useState } from 'react'

const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const toIso = (d) => {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// Calendar dropdown for blocking off days, styled to match the booking flow's
// date step. Click a future day to close it (it turns teal); click again is a
// no-op — remove via the chip list. Stays open so several days can be added.
export default function ClosedDatePicker({ closures, onAdd }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })
  const ref = useRef(null)
  const today = startOfDay(new Date())
  const closed = new Set(closures)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const startWeekday = new Date(view.getFullYear(), view.getMonth(), 1).getDay()
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(view.getFullYear(), view.getMonth(), d))

  const canPrev =
    view.getFullYear() > today.getFullYear() ||
    (view.getFullYear() === today.getFullYear() && view.getMonth() > today.getMonth())

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-2.5 text-left text-sm transition-colors ${
          open ? 'border-teal ring-2 ring-teal/20' : 'border-slate-200 hover:border-teal/50'
        }`}
      >
        <span className="flex items-center gap-2 font-medium text-navy">
          <svg className="h-5 w-5 text-teal" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 9h18M8 3v3M16 3v3M12 12.5v4M10 14.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Add a closed date
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="animate-fade absolute left-0 top-full z-20 mt-2 w-[19rem] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
              disabled={!canPrev}
              className="rounded-lg p-1.5 text-slate-500 enabled:hover:bg-slate-100 disabled:text-slate-200"
              aria-label="Previous month"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="font-semibold text-navy">{monthFmt.format(view)}</span>
            <button
              type="button"
              onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Next month"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
            {weekdays.map((w, i) => (
              <span key={i} className="py-1">{w}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <span key={i} />
              const iso = toIso(day)
              const isClosed = closed.has(iso)
              const isPast = day < today
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isPast || isClosed}
                  onClick={() => onAdd(iso)}
                  className={`h-9 rounded-lg text-sm transition-colors ${
                    isClosed
                      ? 'cursor-default bg-teal font-semibold text-white'
                      : isPast
                        ? 'cursor-not-allowed text-slate-300'
                        : 'text-navy hover:bg-mint'
                  }`}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span className="h-3 w-3 rounded bg-teal" /> Closed
          </p>
        </div>
      )}
    </div>
  )
}
