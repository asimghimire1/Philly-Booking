import { useEffect, useMemo, useState } from 'react'
import { useBooking } from '../context/BookingContext.jsx'
import { useI18n } from '../i18n/LanguageContext.jsx'
import DatePicker from '../components/booking/DatePicker.jsx'
import InfoBox from '../components/booking/InfoBox.jsx'
import BackButton from '../components/booking/BackButton.jsx'
import { selectionMinutes, hasSelection } from '../data/catalog.js'
import { useAvailability } from '../hooks/useAvailability.js'
import { guestAvailabilityParams } from '../services/availabilityService.js'
import { useTherapists } from '../data/therapists.jsx'
import { getLocalDateStr, parseAmPm, findNextAvailableSlot } from '../utils/datetime.js'
import { validatePartySchedule, formatScheduleError } from '../utils/scheduleValidation.js'

function SectionLabel({ children }) { 
  return <p className="text-sm font-medium text-slate-600">{children}</p>
}

function Avatar({ text, primary }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${primary ? 'bg-teal' : 'bg-navy'
        }`}
    >
      {text}
    </span>
  )
}

function GuestDateTimePicker({ guest, name, avatar, primary, showHeader, guests, hasScheduleConflict, therapists, refreshTick }) {
  const { t, lang } = useI18n()
  const { setGuestDate, setGuestTime, setGuestAvailabilityLoading, dateTimeApplying, dateTimeConfiguring } = useBooking()
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'

  const durationMin = selectionMinutes(guest.selection)
  const { therapistId, gender } = guestAvailabilityParams(guest)

  const guestIndex = guests.findIndex((g) => g.id === guest.id)
  const guestDateStr = guest.dateTime?.date ? getLocalDateStr(guest.dateTime.date) : ''
  const partyStartedOnDate = guests.some(
    (other, idx) =>
      idx < guestIndex &&
      other.dateTime?.date &&
      other.dateTime?.time &&
      getLocalDateStr(other.dateTime.date) === guestDateStr,
  )

  const claimedTherapistSlots = useMemo(() => {
    return guests
      .filter((other, idx) => idx < guestIndex && other.dateTime?.date && other.dateTime?.time)
      .filter((other) => getLocalDateStr(other.dateTime.date) === guestDateStr)
      .map((other) => ({
        therapistId: other.therapist?.therapistId || null,
        gender: guestAvailabilityParams(other).gender,
        time: other.dateTime.time,
        durationMin: selectionMinutes(other.selection),
      }))
  }, [guests, guestIndex, guestDateStr])

  // Get availability data
  const { slots, unavailable, closed, loading, error } = useAvailability({
    date: guest.dateTime?.date,
    durationMin,
    therapistId,
    gender,
    claimedTherapistSlots,
    therapists,
    refreshTick,
  })

  useEffect(() => {
    setGuestAvailabilityLoading(guest.id, loading)
  }, [guest.id, loading, setGuestAvailabilityLoading])

  // Spacing label
  const stepLabel = durationMin < 60
    ? `${durationMin} ${lang === 'zh' ? '分钟' : 'min'}`
    : `${durationMin / 60} ${lang === 'zh' ? '小时' : 'hr'}`

  // Drop selected time if it's no longer valid — but not while apply/reload is in progress.
  useEffect(() => {
    if (dateTimeConfiguring) return
    if (guest.dateTime?.time && slots.length > 0) {
      if (!slots.includes(guest.dateTime.time) || unavailable.has(guest.dateTime.time)) {
        const targetMins = parseAmPm(guest.dateTime.time)
        const nextSlot = findNextAvailableSlot(slots, unavailable, targetMins)
        if (nextSlot) setGuestTime(guest.id, nextSlot)
        else setGuestTime(guest.id, null)
      }
    }
  }, [slots, unavailable, guest.dateTime?.time, guest.id, setGuestTime, dateTimeConfiguring])

  // Show warning if no slots are available OR all slots are disabled on a date where other guests have started
  const needsManualTime =
    guest.dateTime?.date &&
    !guest.dateTime?.time &&
    partyStartedOnDate &&
    (slots.length === 0 || (slots.length > 0 && unavailable.size === slots.length))

  return (
    <div className={`space-y-5 rounded-2xl border p-5 bg-white shadow-sm hover:shadow-md transition-shadow ${hasScheduleConflict ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
      }`}>
      {showHeader && (
        <div className="flex items-center gap-3 sm:gap-4 border-b border-slate-100 pb-3">
          <Avatar text={avatar} primary={primary} />
          <div>
            <p className="font-semibold text-navy text-lg">{name}</p>
            <p className="text-xs text-slate-400">
              {guest.therapist?.mode === 'none' ? t('therapist.noPref') : guest.therapist?.therapistId ? t('datetime.slotHint', { dur: stepLabel }) : t('therapist.availability')}
            </p>
          </div>
        </div>
      )}

      <div>
        <SectionLabel>{t('datetime.selectDate')}</SectionLabel>
        <div className="mt-2">
          <DatePicker
            value={guest.dateTime?.date ? new Date(guest.dateTime.date) : new Date()}
            onChange={(date) => setGuestDate(guest.id, date)}
            locale={locale}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <SectionLabel>{t('datetime.availableTimes')}</SectionLabel>
          <span className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium text-teal">
            {t('datetime.slotHint', { dur: stepLabel })}
          </span>
        </div>

        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
            {guest.dateTime?.time && (
              <span className="rounded-full bg-navy px-3 py-1 text-sm font-medium text-white">
                {guest.dateTime.time}
              </span>
            )}
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-teal" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">{lang === 'zh' ? '正在加载可用时间...' : 'Loading times...'}</span>
            </div>
          </div>
        ) : closed ? (
          <div className="py-8 text-center text-sm font-medium text-rose-500 bg-rose-50 rounded-xl border border-rose-100">
            ⚠️ {lang === 'zh' ? '该日期店铺已关闭。请选择其他日期。' : 'The studio is closed on this date. Please pick another.'}
          </div>
        ) : error ? (
          <div className="py-6 text-center text-sm text-rose-500 font-medium">
            Error: {error}
          </div>
        ) : slots.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-400 font-medium">
            {lang === 'zh' ? '无可用时间。' : 'No times available.'}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {slots.map((slot) => {
              const off = unavailable.has(slot)
              const selected = guest.dateTime?.time === slot
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={off}
                  onClick={() => setGuestTime(guest.id, slot)}
                  className={`rounded-xl border px-1 py-2.5 text-center text-sm font-medium transition-colors ${selected
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
        {!loading && needsManualTime && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t('datetime.guestNoSlot')}
          </div>
        )}
        {!loading && hasScheduleConflict && guest.dateTime?.time && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {lang === 'zh'
              ? '此时间与其他客人的预约冲突，或已超过可用理疗师数量。'
              : 'This time conflicts with other guests or exceeds available therapists.'}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DateTimeStep() {
  const { guests, copyDateTimeToAll, dateTimeApplying, dateTimeShortfall, submitError, submitErrorDetail } = useBooking()
  const { therapists } = useTherapists()
  const { t, lang } = useI18n()
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    const bumpRefresh = () => setRefreshTick((n) => n + 1)
    const timer = setInterval(bumpRefresh, 120000) // Refresh every 2 minutes

    return () => clearInterval(timer)
  }, [])

  const nameOf = (g, i) =>
    g.primary ? t('guest.primaryName') : `${t('guest.label')} ${i + 1}`
  const avatarOf = (g, i) => (g.primary ? 'Y' : `G${i + 1}`)
  const single = guests.length === 1
  const counts = (g) => (single ? hasSelection(g.selection) : g.confirmed)
  const scheduleErrors = validatePartySchedule(guests, therapists, counts, selectionMinutes)
  const conflictGuestNums = new Set(scheduleErrors.flatMap((err) => err.guestNums))

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">
        {t('datetime.title')}{' '}
        <span className="text-xl font-normal text-slate-400 sm:text-2xl">
          {t('datetime.titleAlt')}
        </span>
      </h1>
      <p className="text-slate-600">
        {guests.length > 1 ? t('datetime.leadMulti') : t('datetime.leadSingle')}
      </p>

      {submitError === 'SLOT_UNAVAILABLE' && submitErrorDetail && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {submitErrorDetail}
        </div>
      )}

      {scheduleErrors.length > 0 && (
        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {scheduleErrors.map((err, idx) => (
            <p key={idx}>{formatScheduleError(err, t, lang)}</p>
          ))}
        </div>
      )}

      <div className="space-y-8 mt-6">
        {guests.map((guest, i) => (
          <div key={guest.id} className="space-y-3">
            <GuestDateTimePicker
              guest={guest}
              name={nameOf(guest, i)}
              avatar={avatarOf(guest, i)}
              primary={guest.primary}
              showHeader={!single}
              guests={guests}
              hasScheduleConflict={conflictGuestNums.has(i + 1)}
              therapists={therapists}
              refreshTick={refreshTick}
            />
            {i === 0 && !single && guest.dateTime?.time && (
              <div className="flex justify-end pr-2 -mt-2">
                <button
                  type="button"
                  disabled={dateTimeApplying}
                  onClick={copyDateTimeToAll}
                  className={`flex items-center gap-1.5 text-sm font-medium ${dateTimeApplying
                    ? 'cursor-wait text-slate-400'
                    : 'text-teal hover:text-teal-600 hover:underline'
                    }`}
                >
                  {dateTimeApplying ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {dateTimeApplying
                    ? lang === 'zh'
                      ? '正在配置时间...'
                      : 'Configuring times...'
                    : lang === 'zh'
                      ? '应用到所有客人'
                      : 'Apply to all guests'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {dateTimeShortfall > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t('datetime.notEnoughSlots', { count: dateTimeShortfall })}
          </div>
        )}
        <InfoBox>{t('datetime.info')}</InfoBox>
      </div>

      <BackButton />
    </div>
  )
}
