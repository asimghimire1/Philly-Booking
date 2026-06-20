import { useMemo, useState } from 'react'
import { useAdminData } from './data.jsx'
import BookingDetailModal from './BookingDetailModal.jsx'
import { Card, PageHeading } from './ui.jsx'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const START_HOUR = 8
const END_HOUR = 21
const HOUR_H = 56 // px per hour

const toIso = (d) => {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// "10:30 AM" -> minutes since midnight.
function parseTime(t) {
  const m = String(t).match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (h === 12) h = 0
  if (/pm/i.test(m[3])) h += 12
  return h * 60 + min
}
function fmtMin(mins) {
  let h = Math.floor(mins / 60)
  const m = mins % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  h %= 12
  if (h === 0) h = 12
  return `${h}:${String(m).padStart(2, '0')} ${ap}`
}
const hourLabel = (h) => {
  const ap = h >= 12 ? 'PM' : 'AM'
  let hh = h % 12
  if (hh === 0) hh = 12
  return `${hh} ${ap}`
}

// Sunday (start) of the week containing d.
function weekSunday(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - x.getDay())
  return x
}

function NavBtn({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-navy"
    >
      {children}
    </button>
  )
}

const LEGEND = [
  { label: 'Upcoming', cls: 'bg-teal' },
  { label: 'Completed', cls: 'bg-emerald-600' },
  { label: 'Cancelled', cls: 'bg-rose-400' },
]

const tone = (status) =>
  status === 'cancelled'
    ? 'bg-rose-400 hover:bg-rose-500'
    : status === 'completed'
      ? 'bg-emerald-600 hover:bg-emerald-700'
      : 'bg-teal hover:bg-teal-600'

export default function AdminCalendar() {
  const { bookings, setBookingStatus } = useAdminData()
  const [weekStart, setWeekStart] = useState(() => weekSunday(new Date()))
  const [openId, setOpenId] = useState(null)

  const days = useMemo(
    () =>
      [...Array(7)].map((_, i) => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + i)
        return d
      }),
    [weekStart],
  )

  const hours = [...Array(END_HOUR - START_HOUR)].map((_, i) => START_HOUR + i)
  const bodyH = (END_HOUR - START_HOUR) * HOUR_H
  const cols = '64px repeat(7, minmax(0, 1fr))'

  const byDate = useMemo(() => {
    const map = {}
    for (const b of bookings) {
      if (parseTime(b.time) == null) continue
      ;(map[b.date] ??= []).push(b)
    }
    return map
  }, [bookings])

  const todayIso = toIso(new Date())
  const open = bookings.find((b) => b.id === openId)

  const rangeLabel = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  const shiftWeek = (delta) =>
    setWeekStart((s) => {
      const x = new Date(s)
      x.setDate(x.getDate() + delta * 7)
      return x
    })

  // Position/size a block, clamped to the visible window.
  const blockStyle = (b) => {
    const startMin = Math.max(parseTime(b.time), START_HOUR * 60)
    const endMin = Math.min(parseTime(b.time) + (b.durationMin || 60), END_HOUR * 60)
    const top = ((startMin - START_HOUR * 60) / 60) * HOUR_H
    const height = Math.max(((endMin - startMin) / 60) * HOUR_H, 26)
    return { top: `${top}px`, height: `${height}px` }
  }

  return (
    <div className="animate-step">
      <PageHeading
        title="Calendar"
        subtitle={rangeLabel}
        action={
          <div className="flex items-center gap-1.5">
            <NavBtn onClick={() => shiftWeek(-1)} label="Previous week">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </NavBtn>
            <button
              type="button"
              onClick={() => setWeekStart(weekSunday(new Date()))}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-navy"
            >
              Today
            </button>
            <NavBtn onClick={() => shiftWeek(1)} label="Next week">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </NavBtn>
          </div>
        }
      />

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-2 text-sm text-slate-600">
            <span className={`h-3 w-3 rounded ${l.cls}`} />
            {l.label}
          </span>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[840px]">
            {/* Day header */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: cols }}>
              <div className="bg-slate-50" />
              {days.map((d, i) => {
                const isToday = toIso(d) === todayIso
                return (
                  <div
                    key={i}
                    className={`border-l border-slate-200 px-2 py-2.5 text-center ${isToday ? 'bg-teal/5' : 'bg-slate-50'}`}
                  >
                    <p className="text-xs font-medium text-slate-500">{DAY_NAMES[i]}</p>
                    <p className={`mt-0.5 text-sm font-semibold ${isToday ? 'text-teal' : 'text-navy'}`}>
                      {d.getDate()}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Time grid */}
            <div className="grid" style={{ gridTemplateColumns: cols }}>
              {/* Time gutter */}
              <div className="relative bg-slate-50/40" style={{ height: bodyH }}>
                {hours.map((h, i) => (
                  <div
                    key={h}
                    className="absolute right-2 pt-0.5 text-[11px] font-medium text-slate-400"
                    style={{ top: i * HOUR_H }}
                  >
                    {hourLabel(h)}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((d, di) => {
                const list = byDate[toIso(d)] ?? []
                const isToday = toIso(d) === todayIso
                return (
                  <div
                    key={di}
                    className={`relative border-l border-slate-200 ${isToday ? 'bg-teal/[0.03]' : ''}`}
                    style={{ height: bodyH }}
                  >
                    {hours.map((h, i) => (
                      <div
                        key={h}
                        className="absolute inset-x-0 border-t border-slate-100"
                        style={{ top: i * HOUR_H }}
                      />
                    ))}
                    {list.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setOpenId(b.id)}
                        style={blockStyle(b)}
                        className={`absolute inset-x-1 flex flex-col overflow-hidden rounded-lg px-2 py-1 text-left text-white shadow-sm ring-1 ring-black/5 transition-colors ${tone(b.status)}`}
                      >
                        <span className="text-[10px] leading-tight text-white/85">
                          {fmtMin(parseTime(b.time))}
                        </span>
                        <span
                          className={`truncate text-xs font-semibold leading-tight ${b.status === 'cancelled' ? 'line-through' : ''}`}
                        >
                          {b.customer.name}
                        </span>
                        <span className="truncate text-[10px] leading-tight text-white/85">
                          {b.party.length > 1 ? `${b.party.length} guests` : b.party[0].service}
                        </span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      <p className="mt-3 text-center text-xs text-slate-400">
        Tap an appointment to view full details.
      </p>

      <BookingDetailModal
        booking={open}
        onClose={() => setOpenId(null)}
        onSetStatus={setBookingStatus}
      />
    </div>
  )
}
