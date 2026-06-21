import { useEffect, useMemo } from 'react'
import { useBooking } from '../context/BookingContext.jsx'
import { useI18n } from '../i18n/LanguageContext.jsx'
import DatePicker from '../components/booking/DatePicker.jsx'
import InfoBox from '../components/booking/InfoBox.jsx'
import BackButton from '../components/booking/BackButton.jsx'
import { timeSlotsFor, unavailableSlots } from '../data/timeslots.js'
import { selectionMinutes, hasSelection } from '../data/catalog.js'

function SectionLabel({ children }) {
  return <p className="text-sm font-medium text-slate-600">{children}</p>
}

// "30 min" / "1 hr" / "1.5 hr" — for the slot hint, localized.
function durLabel(mins, lang) {
  if (mins < 60) return `${mins} ${lang === 'zh' ? '分钟' : 'min'}`
  const h = mins / 60
  const n = Number.isInteger(h) ? h : h.toFixed(1)
  return `${n} ${lang === 'zh' ? '小时' : 'hr'}`
}

export default function DateTimeStep() {
  const { guests, dateTime, setDate, setTime } = useBooking()
  const { t, lang } = useI18n()
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'

  // The appointment length is the longest service in the party (guests are seen
  // in parallel by different therapists), so the slots fit everyone. The grid is
  // generated from that duration, tying the times directly to the chosen service.
  const apptMinutes = useMemo(() => {
    const mins = guests
      .filter((g) => hasSelection(g.selection))
      .map((g) => selectionMinutes(g.selection))
    return mins.length ? Math.max(...mins) : 60
  }, [guests])

  const slots = useMemo(() => timeSlotsFor(apptMinutes), [apptMinutes])
  const unavailable = unavailableSlots(dateTime.date, slots)

  // If the duration changed (e.g. a different service was picked), drop a time
  // that no longer lines up with the new slots.
  useEffect(() => {
    if (dateTime.time && !slots.includes(dateTime.time)) setTime(null)
  }, [slots, dateTime.time, setTime])

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">
        {t('datetime.title')}{' '}
        <span className="text-xl font-normal text-slate-400 sm:text-2xl">
          {t('datetime.titleAlt')}
        </span>
      </h1>
      <p className="mt-3 text-slate-600">
        {guests.length > 1 ? t('datetime.leadMulti') : t('datetime.leadSingle')}
      </p>

      <div className="mt-7">
        <SectionLabel>{t('datetime.selectDate')}</SectionLabel>
        <div className="mt-2">
          <DatePicker value={dateTime.date} onChange={setDate} locale={locale} />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <SectionLabel>{t('datetime.availableTimes')}</SectionLabel>
          <span className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium text-teal">
            {t('datetime.slotHint', { dur: durLabel(apptMinutes, lang) })}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {slots.map((slot) => {
            const off = unavailable.has(slot)
            const selected = dateTime.time === slot
            return (
              <button
                key={slot}
                type="button"
                disabled={off}
                onClick={() => setTime(slot)}
                className={`rounded-xl border px-1 py-2.5 text-center text-sm font-medium transition-colors ${
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
      </div>

      <div className="mt-6">
        <InfoBox>{t('datetime.info')}</InfoBox>
      </div>

      <BackButton />
    </div>
  )
}
