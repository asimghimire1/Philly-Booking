import { useEffect, useRef, useState } from 'react'

const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

// Lightweight, dependency-free calendar dropdown. Past days are disabled and
// the long, localized date is shown on the trigger.
export default function DatePicker({ value, onChange, locale }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1),
  )
  const ref = useRef(null)
  const today = startOfDay(new Date())

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const longFmt = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const monthFmt = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  })
  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: 'narrow' })
  // Jan 1 2023 is a Sunday — gives locale-correct weekday initials.
  const weekdays = [...Array(7)].map((_, i) =>
    weekdayFmt.format(new Date(2023, 0, 1 + i)),
  )

  const startWeekday = new Date(view.getFullYear(), view.getMonth(), 1).getDay()
  const daysInMonth = new Date(
    view.getFullYear(),
    view.getMonth() + 1,
    0,
  ).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(view.getFullYear(), view.getMonth(), d))

  const canPrev =
    view.getFullYear() > today.getFullYear() ||
    (view.getFullYear() === today.getFullYear() &&
      view.getMonth() > today.getMonth())

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-teal/50"
      >
        <span className="flex min-w-0 items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-teal" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 9h18M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="truncate font-medium text-navy">
            {longFmt.format(value)}
          </span>
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
        <div className="absolute left-0 top-full z-20 mt-2 w-[19rem] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
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
            {cells.map((day, i) =>
              day === null ? (
                <span key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  disabled={day < today}
                  onClick={() => {
                    onChange(day)
                    setOpen(false)
                  }}
                  className={`h-9 rounded-lg text-sm transition-colors ${
                    sameDay(day, value)
                      ? 'bg-navy font-semibold text-white'
                      : day < today
                        ? 'cursor-not-allowed text-slate-300'
                        : 'text-navy hover:bg-mint'
                  }`}
                >
                  {day.getDate()}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}
