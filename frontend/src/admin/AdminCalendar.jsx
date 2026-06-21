import { useMemo, useState } from 'react'
import Modal from '../components/booking/Modal.jsx'
import { useAdminData } from './data.jsx'
import BookingDetailModal from './BookingDetailModal.jsx'
import { Card, PageHeading, StatusBadge } from './ui.jsx'

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

// Group appointments whose times overlap into clusters, so stacked blocks
// (which are unreadable) collapse into a single count block.
function clusterOverlaps(items) {
  const sorted = [...items].sort((a, b) => a.start - b.start)
  const clusters = []
  let cur = null
  for (const it of sorted) {
    if (!cur || it.start >= cur.end) {
      cur = { start: it.start, end: it.start + it.dur, items: [it] }
      clusters.push(cur)
    } else {
      cur.items.push(it)
      cur.end = Math.max(cur.end, it.start + it.dur)
    }
  }
  return clusters
}

// Shown in place of overlapping blocks: a navy block with the count.
function GroupBlock({ count, time, style, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className="absolute inset-x-1 flex flex-col overflow-hidden rounded-lg bg-navy px-2 py-1 text-left text-white shadow-md ring-1 ring-black/10 transition-colors hover:bg-navy-600"
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[10px] text-white/80">{time}</span>
        <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-navy">
          {count}
        </span>
      </div>
      <span className="truncate text-xs font-semibold leading-tight">{count} bookings</span>
      <span className="truncate text-[10px] text-white/80">Tap to view all</span>
    </button>
  )
}

// Renders one column's appointments, collapsing overlaps into a count block.
function ColumnBlocks({ items, startHour, endHour, onOpen, onGroup }) {
  return clusterOverlaps(items).map((c, i) => {
    if (c.items.length === 1) {
      const it = c.items[0]
      return (
        <Block
          key={it.id}
          status={it.status}
          strike={it.status === 'cancelled'}
          style={blockStyle(it.start, it.dur, startHour, endHour)}
          time={fmtMin(it.start)}
          title={it.title}
          sub={it.sub}
          onClick={() => onOpen(it.bookingId)}
        />
      )
    }
    return (
      <GroupBlock
        key={`g${i}`}
        count={c.items.length}
        time={fmtMin(c.start)}
        style={blockStyle(c.start, c.end - c.start, startHour, endHour)}
        onClick={() => onGroup(c.items)}
      />
    )
  })
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
function WeekView({ bookings, weekStart, onOpen, onGroup }) {
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
            const items = (byDate[toIso(d)] ?? []).map((b) => ({
              id: b.id,
              bookingId: b.id,
              status: b.status,
              title: b.customer.name,
              sub:
                b.party.length > 1
                  ? `${b.party.length} guests`
                  : `${b.party[0].service} · ${b.party[0].therapist}`,
              start: parseTime(b.time),
              dur: b.durationMin || 60,
            }))
            const isToday = toIso(d) === todayIso
            return (
              <div key={di} className={`relative border-l border-slate-200 ${isToday ? 'bg-teal/[0.03]' : ''}`} style={{ height: bodyH }}>
                <HourLines hours={hours} startHour={START} />
                <ColumnBlocks items={items} startHour={START} endHour={END} onOpen={onOpen} onGroup={onGroup} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Day view (one column per staff) ─────────────────────────────────────────
function DayView({ bookings, staff, availability, dayDate, onOpen, onGroup }) {
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
          {columns.map((c) => {
            const items = apptsFor(c).map((a) => ({
              id: a.key,
              bookingId: a.booking.id,
              status: a.booking.status,
              title: a.guest.name,
              sub: a.guest.service,
              start: parseTime(a.booking.time),
              dur: a.booking.durationMin || 60,
            }))
            return (
              <div key={c.id} className="relative border-l border-slate-200" style={{ height: bodyH }}>
                <HourLines hours={hours} startHour={startHour} />
                <ColumnBlocks items={items} startHour={startHour} endHour={endHour} onOpen={onOpen} onGroup={onGroup} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Mobile agenda (day-grouped list) ────────────────────────────────────────
const timeRange = (startMin, durationMin) =>
  `${fmtMin(startMin)} - ${fmtMin(startMin + (durationMin || 60))}`

const cardTone = (status) =>
  status === 'cancelled' ? 'bg-rose-400' : status === 'completed' ? 'bg-emerald-600' : 'bg-teal'

function AgendaCard({ status, title, sub, start, durationMin, onClick }) {
  const badge =
    status === 'cancelled' ? 'Cancelled' : status === 'completed' ? 'Completed' : null
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col gap-1 rounded-2xl p-4 text-left text-white shadow-sm transition active:scale-[0.99] ${cardTone(status)}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-white/90">{timeRange(start, durationMin)}</span>
        {badge && (
          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
            {badge}
          </span>
        )}
      </div>
      <span
        className={`text-base font-semibold leading-snug ${status === 'cancelled' ? 'line-through decoration-white/60' : ''}`}
      >
        {title}
      </span>
      {sub && <span className="text-sm text-white/85">{sub}</span>}
    </button>
  )
}

function AgendaSection({ title, meta, children }) {
  return (
    <section className="mt-6 first:mt-0">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
        {meta && <span className="text-sm font-medium text-slate-400">{meta}</span>}
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  )
}

function EmptyAgenda({ text }) {
  return <Card className="p-10 text-center text-sm text-slate-400">{text}</Card>
}

function WeekAgenda({ bookings, weekStart, onOpen }) {
  const days = [...Array(7)].map((_, i) => addDays(weekStart, i))
  const byDate = {}
  for (const b of bookings) {
    if (parseTime(b.time) == null) continue
    ;(byDate[b.date] ??= []).push(b)
  }
  const todayIso = toIso(new Date())
  const sections = days
    .map((d, i) => ({
      d,
      i,
      list: (byDate[toIso(d)] ?? []).sort((a, b) => parseTime(a.time) - parseTime(b.time)),
    }))
    .filter((s) => s.list.length)

  if (!sections.length) return <EmptyAgenda text="No appointments this week." />

  return (
    <div>
      {sections.map(({ d, i, list }) => (
        <AgendaSection
          key={i}
          title={DAY_NAMES[i]}
          meta={
            toIso(d) === todayIso
              ? 'Today'
              : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }
        >
          {list.map((b) => (
            <AgendaCard
              key={b.id}
              status={b.status}
              title={b.customer.name}
              sub={
                b.party.length > 1
                  ? `${b.party.length} guests`
                  : `${b.party[0].service} · ${b.party[0].therapist}`
              }
              start={parseTime(b.time)}
              durationMin={b.durationMin}
              onClick={() => onOpen(b.id)}
            />
          ))}
        </AgendaSection>
      ))}
    </div>
  )
}

function DayAgenda({ bookings, staff, dayDate, onOpen }) {
  const dayIso = toIso(dayDate)
  const appts = []
  for (const b of bookings) {
    if (b.date !== dayIso || parseTime(b.time) == null) continue
    b.party.forEach((p, i) => appts.push({ booking: b, guest: p, key: `${b.id}-${i}` }))
  }
  const activeStaff = staff.filter((s) => s.active)
  const staffNames = new Set(activeStaff.map((s) => s.name))
  const cols = [
    ...activeStaff.map((s) => ({ id: s.id, name: s.name, unassigned: false })),
    { id: 'unassigned', name: 'Unassigned', unassigned: true },
  ]
  const groups = cols
    .map((c) => ({
      c,
      items: appts
        .filter((a) =>
          c.unassigned ? !staffNames.has(a.guest.therapist) : a.guest.therapist === c.name,
        )
        .sort((a, b) => parseTime(a.booking.time) - parseTime(b.booking.time)),
    }))
    .filter((g) => g.items.length)

  if (!groups.length) return <EmptyAgenda text="No appointments this day." />

  return (
    <div>
      {groups.map(({ c, items }) => (
        <AgendaSection key={c.id} title={c.name} meta={`${items.length} appt${items.length > 1 ? 's' : ''}`}>
          {items.map((a) => (
            <AgendaCard
              key={a.key}
              status={a.booking.status}
              title={a.guest.name}
              sub={
                a.guest.name === a.booking.customer.name
                  ? a.guest.service
                  : `${a.guest.service} · ${a.booking.customer.name}`
              }
              start={parseTime(a.booking.time)}
              durationMin={a.booking.durationMin}
              onClick={() => onOpen(a.booking.id)}
            />
          ))}
        </AgendaSection>
      ))}
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

// Lists the appointments behind an overlap-count block; tap one for full detail.
function OverlapModal({ items, onClose, onPick }) {
  return (
    <Modal open={!!items} onClose={onClose}>
      {items && (
        <>
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-navy">
                {items.length} overlapping appointments
              </h2>
              <p className="mt-1 text-sm text-slate-500">Tap one to see full details.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto px-6 py-5">
            {[...items]
              .sort((a, b) => a.start - b.start)
              .map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => onPick(it.bookingId)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-teal hover:bg-mint/40"
                >
                  <span className={`h-10 w-1.5 shrink-0 rounded-full ${cardTone(it.status)}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy">{it.title}</p>
                    <p className="truncate text-sm text-slate-500">
                      {timeRange(it.start, it.dur)} · {it.sub}
                    </p>
                  </div>
                  <StatusBadge status={it.status} />
                  <svg className="h-5 w-5 shrink-0 text-slate-300" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
          </div>
        </>
      )}
    </Modal>
  )
}

export default function AdminCalendar() {
  const { bookings, staff, availability, setBookingStatus } = useAdminData()
  const [view, setView] = useState('week')
  const [weekStart, setWeekStart] = useState(() => weekSunday(new Date()))
  const [dayDate, setDayDate] = useState(startOfToday)
  const [openId, setOpenId] = useState(null)
  const [overlap, setOverlap] = useState(null) // items behind a tapped count block
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

      {/* Desktop: time-grid. */}
      <Card className="hidden overflow-hidden lg:block">
        {view === 'week' ? (
          <WeekView
            bookings={bookings}
            weekStart={weekStart}
            onOpen={setOpenId}
            onGroup={setOverlap}
          />
        ) : (
          <DayView
            bookings={bookings}
            staff={staff}
            availability={availability}
            dayDate={dayDate}
            onOpen={setOpenId}
            onGroup={setOverlap}
          />
        )}
      </Card>

      {/* Mobile: day/staff-grouped agenda list. */}
      <div className="lg:hidden">
        {view === 'week' ? (
          <WeekAgenda bookings={bookings} weekStart={weekStart} onOpen={setOpenId} />
        ) : (
          <DayAgenda bookings={bookings} staff={staff} dayDate={dayDate} onOpen={setOpenId} />
        )}
      </div>

      <p className="mt-3 hidden text-center text-xs text-slate-400 lg:block">
        Tap an appointment to view full details.
      </p>

      <OverlapModal
        items={overlap}
        onClose={() => setOverlap(null)}
        onPick={(id) => {
          setOverlap(null)
          setOpenId(id)
        }}
      />

      <BookingDetailModal
        booking={open}
        onClose={() => setOpenId(null)}
        onSetStatus={setBookingStatus}
      />
    </div>
  )
}