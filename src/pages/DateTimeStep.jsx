import { useBooking } from '../context/BookingContext.jsx'
import { useI18n } from '../i18n/LanguageContext.jsx'
import DatePicker from '../components/booking/DatePicker.jsx'
import InfoBox from '../components/booking/InfoBox.jsx'
import BackButton from '../components/booking/BackButton.jsx'
import { timeSlots, unavailableSlots } from '../data/timeslots.js'

function SectionLabel({ children }) {
  return <p className="mb-2 text-sm font-medium text-slate-600">{children}</p>
}

export default function DateTimeStep() {
  const { guests, dateTime, setDate, setTime } = useBooking()
  const { t, lang } = useI18n()
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'
  const unavailable = unavailableSlots(dateTime.date)

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
        <DatePicker value={dateTime.date} onChange={setDate} locale={locale} />
      </div>

      <div className="mt-6">
        <SectionLabel>{t('datetime.availableTimes')}</SectionLabel>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {timeSlots.map((slot) => {
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
                      ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
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
