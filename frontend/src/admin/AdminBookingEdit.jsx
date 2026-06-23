import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DatePicker from '../components/booking/DatePicker.jsx'
import Dropdown from '../components/booking/Dropdown.jsx'
import Pill from '../components/booking/Pill.jsx'
import SelectableCard from '../components/booking/SelectableCard.jsx'
import {
  categories,
  durations,
  addons,
  combos,
  comboOptions,
  getCategory,
  getCombo,
  bilingual,
  localName,
  hasSelection,
  selectionMinutes,
} from '../data/catalog.js'
import { useTherapists } from '../data/therapists.jsx'
import { useAvailability } from '../hooks/useAvailability.js'
import { guestAvailabilityParams } from '../services/availabilityService.js'
import { getLocalDateStr } from '../services/availabilityService.js'
import { updateBookings } from '../services/adminBookingService.js'
import { AdminEditProvider, useAdminEdit } from './AdminEditContext.jsx'
import { useAdminData } from './data.jsx'
import {
  buildUpdatePayloads,
  editTotals,
  hydrateEditState,
} from '../utils/bookingEditUtils.js'
import { Card, PageHeading, StatusBadge, money, fieldCls } from './ui.jsx'

const THERAPIST_MODES = ['none', 'female', 'male', 'name']

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{children}</h3>
  )
}

function GuestServiceSection({ guest }) {
  const {
    setMode,
    setCategory,
    setDuration,
    setPick,
    setCombo,
    updateSlot,
    toggleAddon,
  } = useAdminEdit()
  const sel = guest.selection
  const cat = getCategory(sel.categoryId)
  const id = guest.bookingId

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Pill active={sel.mode === 'single'} onClick={() => setMode(id, 'single')}>
          Single
        </Pill>
        <Pill active={sel.mode === 'combo'} onClick={() => setMode(id, 'combo')}>
          Combo
        </Pill>
      </div>

      {sel.mode === 'single' ? (
        <>
          <div>
            <SectionTitle>Category</SectionTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Pill key={c.id} active={sel.categoryId === c.id} onClick={() => setCategory(id, c.id)}>
                  {bilingual(c)}
                </Pill>
              ))}
            </div>
          </div>

          {cat?.type === 'duration' && (
            <div>
              <SectionTitle>Duration</SectionTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {durations.map((d) => (
                  <Pill key={d.id} active={sel.durationId === d.id} onClick={() => setDuration(id, d.id)}>
                    {d.pill} · ${d.price}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionTitle>{cat?.type === 'duration' ? 'Technique' : 'Service'}</SectionTitle>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {(cat?.type === 'duration' ? cat.techniques : cat?.services ?? []).map((item) => (
                <SelectableCard
                  key={item.id}
                  selected={sel.pickId === item.id}
                  onClick={() => setPick(id, item.id)}
                  title={item.nameEn}
                  desc={cat.type === 'fixed' ? `${item.min} min · $${item.price}` : item.descEn}
                  priceLabel={cat.type === 'fixed' ? `$${item.price}` : undefined}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <SectionTitle>Combo size</SectionTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {combos.map((c) => (
                <Pill key={c.id} active={sel.comboId === c.id} onClick={() => setCombo(id, c.id)}>
                  {c.nameEn} · ${c.price}
                </Pill>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle>Combo picks</SectionTitle>
            <div className="mt-2 space-y-2">
              {Array.from({ length: getCombo(sel.comboId)?.slots ?? 0 }).map((_, i) => (
                <Dropdown
                  key={i}
                  value={sel.slots[i]}
                  onChange={(v) => updateSlot(id, i, v)}
                  placeholder={`Service ${i + 1}`}
                  options={comboOptions.map((o) => ({ id: o.id, label: o.nameEn }))}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <SectionTitle>Add-ons</SectionTitle>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {addons.map((a) => (
            <SelectableCard
              key={a.id}
              selected={sel.addonIds.includes(a.id)}
              onClick={() => toggleAddon(id, a.id)}
              title={a.nameEn}
              desc={a.descEn}
              priceLabel={a.free ? 'Free' : `+$${a.price}`}
              priceFree={a.free}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function GuestTherapistSection({ guest }) {
  const { setTherapistMode, setTherapist } = useAdminEdit()
  const { therapists } = useTherapists()
  const pref = guest.therapist ?? { mode: 'none', therapistId: null }
  const id = guest.bookingId

  const visible =
    pref.mode === 'name'
      ? therapists
      : pref.mode === 'female' || pref.mode === 'male'
        ? therapists.filter((th) => th.gender === pref.mode)
        : []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {THERAPIST_MODES.map((m) => (
          <Pill key={m} active={pref.mode === m} onClick={() => setTherapistMode(id, m)}>
            {m === 'none' ? 'No preference' : m === 'name' ? 'Pick by name' : m.charAt(0).toUpperCase() + m.slice(1)}
          </Pill>
        ))}
      </div>
      {visible.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((th) => (
            <SelectableCard
              key={th.id}
              selected={pref.therapistId === th.id}
              onClick={() => setTherapist(id, th.id)}
              title={th.name}
              desc={`${th.gender} · ${th.role}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function GuestDateTimeSection({ guest, excludeBookingIds, therapists }) {
  const { setGuestDate, setGuestTime } = useAdminEdit()
  const id = guest.bookingId
  const durationMin = selectionMinutes(guest.selection)
  const { therapistId, gender } = guestAvailabilityParams(guest)

  const { slots, unavailable, closed, loading, error } = useAvailability({
    date: guest.dateTime?.date,
    durationMin,
    therapistId,
    gender,
    therapists,
    excludeBookingIds,
  })

  const stepLabel = durationMin < 60 ? `${durationMin} min` : `${durationMin / 60} hr`

  return (
    <div className="space-y-4">
      <div>
        <SectionTitle>Date</SectionTitle>
        <div className="mt-2">
          <DatePicker
            value={guest.dateTime?.date ? new Date(guest.dateTime.date) : new Date()}
            onChange={(date) => setGuestDate(id, date)}
          />
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <SectionTitle>Time</SectionTitle>
          <span className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium text-teal">
            {stepLabel} slots
          </span>
        </div>
        {loading ? (
          <p className="py-4 text-sm text-slate-400">Loading available times…</p>
        ) : closed ? (
          <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            Studio closed on this date.
          </p>
        ) : error ? (
          <p className="text-sm text-rose-500">{error}</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-slate-400">No times available.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {slots.map((slot) => {
              const off = unavailable.has(slot)
              const selected = guest.dateTime?.time === slot
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={off}
                  onClick={() => setGuestTime(id, slot)}
                  className={`rounded-xl border px-1 py-2 text-center text-sm font-medium transition-colors ${
                    selected
                      ? 'border-navy bg-navy text-white'
                      : off
                        ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through'
                        : 'border-slate-200 bg-white text-navy hover:border-teal/50'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EditForm() {
  const navigate = useNavigate()
  const { ref, status, customer, details, guests, bookingGroupId, excludeBookingIds, patchDetails } =
    useAdminEdit()
  const guest = guests[0]
  const { therapists } = useTherapists()
  const { refresh } = useAdminData()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [errorDetail, setErrorDetail] = useState(null)

  const totals = editTotals(guests, details)
  const canSave = guest && hasSelection(guest.selection) && guest.dateTime?.time

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setErrorDetail(null)
    try {
      const payloads = buildUpdatePayloads({ guests, customer, details })
      await updateBookings(payloads)
      await refresh()
      navigate('/admin/bookings', { replace: true })
    } catch (err) {
      setError(err.message)
      setErrorDetail(err.detail || null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={status} />
        <span className="text-sm text-slate-500">{ref}</span>
         {status === 'cancelled' && (
           <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
             Cancelled — saving will keep this status.
           </span>
         )}
      </div>

      {bookingGroupId && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Part of a multi-guest booking — this page edits <strong>this guest only</strong>. Other
          guests have their own booking rows in the list.
        </div>
      )}

      {(error || errorDetail) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorDetail || error}
        </div>
      )}

      {guest && (
        <Card>
          <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
             <p className="font-semibold text-navy">{guest.guestDisplayName || guest.guestName}</p>
            <p className="text-sm text-slate-500">
              {customer.name} ·{' '}
              {guest.dateTime?.time
                ? `${getLocalDateStr(guest.dateTime.date)} · ${guest.dateTime.time}`
                : 'No time selected'}
            </p>
          </div>
          <div className="space-y-8 p-5">
            <div>
              <SectionTitle>Services & add-ons</SectionTitle>
              <div className="mt-3">
                <GuestServiceSection guest={guest} />
              </div>
            </div>
            <div>
              <SectionTitle>Therapist</SectionTitle>
              <div className="mt-3">
                <GuestTherapistSection guest={guest} />
              </div>
            </div>
            <div className="relative z-10">
              <SectionTitle>Date & time</SectionTitle>
              <div className="mt-3">
                <GuestDateTimeSection
                  guest={guest}
                  excludeBookingIds={excludeBookingIds}
                  therapists={therapists}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <SectionTitle>Booking details</SectionTitle>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Note</label>
            <textarea
              value={details.note}
              onChange={(e) => patchDetails({ note: e.target.value })}
              rows={3}
              className={`${fieldCls} resize-y`}
              placeholder="Customer note…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Tip ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={details.tip}
                onChange={(e) => patchDetails({ tip: e.target.value })}
                className={fieldCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Payment</label>
              <select
                value={details.payment}
                onChange={(e) => patchDetails({ payment: e.target.value })}
                className={fieldCls}
              >
                <option value="prepay">Prepay</option>
                <option value="visit">Pay at visit</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Services</span>
            <span className="font-medium text-navy">{money(totals.servicesTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Add-ons</span>
            <span className="font-medium text-navy">{money(totals.addonsTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tip</span>
            <span className="font-medium text-navy">{money(totals.tip)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-navy">
            <span>Total</span>
            <span>{money(totals.total)}</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-8">
        <Link
          to="/admin/bookings"
          className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:text-navy"
        >
          Cancel
        </Link>
        <button
          type="button"
          disabled={!canSave || saving}
          onClick={handleSave}
          className={`rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-colors ${
            canSave && !saving
              ? 'bg-teal hover:bg-teal-600'
              : 'cursor-not-allowed bg-slate-300'
          }`}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

export default function AdminBookingEdit() {
  const { id } = useParams()
  const { bookings, staff, loading } = useAdminData()
  const row = useMemo(() => bookings.find((b) => b.id === id), [bookings, id])
  const initial = useMemo(() => (row ? hydrateEditState(row, staff) : null), [row, staff])

  if (loading) {
    return <Card className="p-10 text-center text-sm text-slate-400">Loading…</Card>
  }

  if (!initial) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-slate-500">Booking not found.</p>
        <Link to="/admin/bookings" className="mt-4 inline-block text-sm font-medium text-teal hover:underline">
          Back to bookings
        </Link>
      </Card>
    )
  }

  return (
    <div className="animate-step">
      <PageHeading
        title="Edit guest booking"
        subtitle={`${initial.customer.name} · ${initial.guests[0]?.guestDisplayName || initial.guests[0]?.guestName || 'Guest'} · ${initial.ref}`}
      />
      <AdminEditProvider initial={initial}>
        <EditForm />
      </AdminEditProvider>
    </div>
  )
}
