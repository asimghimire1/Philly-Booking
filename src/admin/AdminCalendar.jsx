import { useMemo, useState } from 'react'
import { useAdminData } from './data.jsx'
import BookingDetailModal from './BookingDetailModal.jsx'
import { Card, PageHeading } from './ui.jsx'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DOW_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const HOUR_H = 56 // px per hour

const toIso = (d) => {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
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
const initials = (name) =>
  (name || '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

function weekSunday(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - x.getDay())
  return x
}

const tone = (status) =>
  status === 'cancelled'
    ? 'bg-rose-400 hover:bg-rose-500'
    : status === 'completed'
      ? 'bg-emerald-600 hover:bg-emerald-700'
      : 'bg-teal hover:bg-teal-600'

const LEGEND = [
  { label: 'Upcoming', cls: 'bg-teal' },
  { label: 'Completed', cls: 'bg-emerald-600' },
  { label: 'Cancelled', cls: 'bg-rose-400' },
]

// Position a block within [startHour, endHour], clamped to the visible window.
function blockStyle(startMin, durationMin, startHour, endHour) {
  const s = Math.max(startMin, startHour * 60)
  const e = Math.min(startMin + (durationMin || 60), endHour * 60)
  const top = ((s - startHour * 60) / 60) * HOUR_H
  const height = Math.max(((e - s) / 60) * HOUR_H, 26)
  return { top: `${top}px`, height: `${height}px` }
}

function Block({ status, style, time, title, sub, strike, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`absolute inset-x-1 flex flex-col overflow-hidden rounded-lg px-2 py-1 text-left text-white shadow-sm ring-1 ring-black/5 transition-colors ${tone(status)}`}
    >
      <span className="text-[10px] leading-tight text-white/85">{time}</span>
      <span className={`truncate text-xs font-semibold leading-tight ${strike ? 'line-through' : ''}`}>
        {title}
      </span>
      {sub && <span className="truncate text-[10px] leading-tight text-white/85">{sub}</span>}
    </button>
  )
}

function HourLines({ hours, startHour }) {
  return hours.map((h) => (
    <div
      key={h}
      className="absolute inset-x-0 border-t border-slate-100"
      style={{ top: (h - startHour) * HOUR_H }}
    />
  ))
}

function TimeGutter({ hours, startHour, bodyH }) {
  return (
    <div className="relative bg-slate-50/40" style={{ height: bodyH }}>
      {hours.map((h) => (
        <div
          key={h}
          className="absolute right-2 pt-0.5 text-[11px] font-medium text-slate-400"
          style={{ top: (h - startHour) * HOUR_H }}
        >
          {hourLabel(h)}
        </div>
      ))}
    </div>
  )
}

// ── Week view (7 day columns) ───────────────────────────────────────────────
function WeekView({ bookings, weekStart, onOpen }) {
  const START = 8
  const END = 21
  const hours = [...Array(END - START)].map((_, i) => START + i)
  const bodyH = (END - START) * HOUR_H
  const cols = '64px repeat(7, minmax(0, 1fr))'
  const todayIso = toIso(new Date())

  const days = [...Array(7)].map((_, i) => addDays(weekStart, i))
  const byDate = useMemo(() => {
    const map = {}
    for (const b of bookings) {
      if (parseTime(b.time) == null) continue
      ;(map[b.date] ??= []).push(b)
    }
    return map
  }, [bookings])

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[840px]">
        <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: cols }}>
          <div className="bg-slate-50" />
          {days.map((d, i) => {
            const isToday = toIso(d) === todayIso
            return (
              <div key={i} className={`border-l border-slate-200 px-2 py-2.5 text-center ${isToday ? 'bg-teal/5' : 'bg-slate-50'}`}>
                <p className="text-xs font-medium text-slate-500">{DAY_NAMES[i]}</p>
                <p className={`mt-0.5 text-sm font-semibold ${isToday ? 'text-teal' : 'text-navy'}`}>{d.getDate()}</p>
              </div>
            )
          })}
        </div>

        <div className="grid" style={{ gridTemplateColumns: cols }}>
          <TimeGutter hours={hours} startHour={START} bodyH={bodyH} />
          {days.map((d, di) => {
            const list = byDate[toIso(d)] ?? []
            const isToday = toIso(d) === todayIso
            return (
              <div key={di} className={`relative border-l border-slate-200 ${isToday ? 'bg-teal/[0.03]' : ''}`} style={{ height: bodyH }}>
                <HourLines hours={hours} startHour={START} />
                {list.map((b) => (
                  <Block
                    key={b.id}
                    status={b.status}
                    strike={b.status === 'cancelled'}
                    style={blockStyle(parseTime(b.time), b.durationMin, START, END)}
                    time={fmtMin(parseTime(b.time))}
                    title={b.customer.name}
                    sub={b.party.length > 1 ? `${b.party.length} guests` : b.party[0].service}
                    onClick={() => onOpen(b.id)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Day view (one column per staff) ─────────────────────────────────────────
function DayView({ bookings, staff, availability, dayDate, onOpen }) {
  const key = DOW_KEYS[dayDate.getDay()]
  const cfg = availability.hours[key]
  const isOpen = cfg?.open
  const startHour = isOpen ? parseInt(cfg.start.split(':')[0], 10) : 8
  const endRaw = isOpen ? cfg.end.split(':').map(Number) : [21, 0]
  const endHour = Math.max(startHour + 1, endRaw[1] > 0 ? endRaw[0] + 1 : endRaw[0])
  const hours = [...Array(endHour - startHour)].map((_, i) => startHour + i)
  const bodyH = (endHour - startHour) * HOUR_H

  const dayIso = toIso(dayDate)
  const activeStaff = staff.filter((s) => s.active)
  const staffNames = new Set(activeStaff.map((s) => s.name))

  // One appointment per guest, tagged with the booking it belongs to.
  const appts = useMemo(() => {
    const out = []
    for (const b of bookings) {
      if (b.date !== dayIso || parseTime(b.time) == null) continue
      b.party.forEach((p, i) => out.push({ booking: b, guest: p, key: `${b.id}-${i}` }))
    }
    return out
  }, [bookings, dayIso])

  const hasUnassigned = appts.some((a) => !staffNames.has(a.guest.therapist))
  const columns = [
    ...activeStaff.map((s) => ({ id: s.id, name: s.name, unassigned: false })),
    ...(hasUnassigned ? [{ id: 'unassigned', name: 'Unassigned', unassigned: true }] : []),
  ]
  const apptsFor = (col) =>
    appts.filter((a) =>
      col.unassigned ? !staffNames.has(a.guest.therapist) : a.guest.therapist === col.name,
    )

  const cols = `64px repeat(${columns.length}, minmax(150px, 1fr))`
  const minW = 64 + columns.length * 150

  if (columns.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">
        No active staff. Add staff to see the day schedule.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: minW }}>
        {/* Staff header */}
        <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: cols }}>
          <div className="bg-slate-50" />
          {columns.map((c) => (
            <div key={c.id} className="flex flex-col items-center gap-1 border-l border-slate-200 bg-slate-50 px-2 py-2.5">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${c.unassigned ? 'bg-slate-400' : 'bg-navy'}`}>
                {c.unassigned ? '–' : initials(c.name)}
              </span>
              <span className="max-w-full truncate text-xs font-medium text-navy">{c.name}</span>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="grid" style={{ gridTemplateColumns: cols }}>
          <TimeGutter hours={hours} startHour={startHour} bodyH={bodyH} />
          {columns.map((c) => (
            <div key={c.id} className="relative border-l border-slate-200" style={{ height: bodyH }}>
              <HourLines hours={hours} startHour={startHour} />
              {apptsFor(c).map((a) => (
                <Block
                  key={a.key}
                  status={a.booking.status}
                  strike={a.booking.status === 'cancelled'}
                  style={blockStyle(parseTime(a.booking.time), a.booking.durationMin, startHour, endHour)}
                  time={fmtMin(parseTime(a.booking.time))}
                  title={a.guest.name}
                  sub={a.guest.service}
                  onClick={() => onOpen(a.booking.id)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
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

export default function AdminCalendar() {
  const { bookings, staff, availability, setBookingStatus } = useAdminData()
  const [view, setView] = useState('week')
  const [weekStart, setWeekStart] = useState(() => weekSunday(new Date()))
  const [dayDate, setDayDate] = useState(startOfToday)
  const [openId, setOpenId] = useState(null)
  const open = bookings.find((b) => b.id === openId)

  const days = [...Array(7)].map((_, i) => addDays(weekStart, i))
  const weekLabel = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const dayKey = DOW_KEYS[dayDate.getDay()]
  const dayClosed = view === 'day' && !availability.hours[dayKey]?.open

  const go = (delta) =>
    view === 'week'
      ? setWeekStart((s) => addDays(s, delta * 7))
      : setDayDate((s) => addDays(s, delta))
  const goToday = () => {
    setWeekStart(weekSunday(new Date()))
    setDayDate(startOfToday())
  }

  const tab = (id, label) => (
    <button
      type="button"
      onClick={() => setView(id)}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        view === id ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-navy'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="animate-step">
      <PageHeading
        title="Calendar"
        subtitle={view === 'week' ? weekLabel : dayLabel}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-slate-100 p-1">
              {tab('week', 'Week')}
              {tab('day', 'Day · by staff')}
            </div>
            <div className="flex items-center gap-1.5">
              <NavBtn onClick={() => go(-1)} label="Previous">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </NavBtn>
              <button
                type="button"
                onClick={goToday}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-navy"
              >
                Today
              </button>
              <NavBtn onClick={() => go(1)} label="Next">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </NavBtn>
            </div>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-2 text-sm text-slate-600">
            <span className={`h-3 w-3 rounded ${l.cls}`} />
            {l.label}
          </span>
        ))}
        {dayClosed && (
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-500">
            Closed this day
          </span>
        )}
      </div>

      <Card className="overflow-hidden">
        {view === 'week' ? (
          <WeekView bookings={bookings} weekStart={weekStart} onOpen={setOpenId} />
        ) : (
          <DayView
            bookings={bookings}
            staff={staff}
            availability={availability}
            dayDate={dayDate}
            onOpen={setOpenId}
          />
        )}
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
