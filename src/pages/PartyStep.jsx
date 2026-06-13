import { useBooking } from '../context/BookingContext.jsx'
import { useI18n } from '../i18n/LanguageContext.jsx'
import GuestCard from '../components/booking/GuestCard.jsx'
import InfoBox from '../components/booking/InfoBox.jsx'

export default function PartyStep() {
  const { guests, addGuest, removeGuest } = useBooking()
  const { t } = useI18n()

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">
        {t('party.title')}{' '}
        <span className="text-xl font-normal text-slate-400 sm:text-2xl">
          {t('party.titleAlt')}
        </span>
      </h1>
      <p className="mt-3 text-slate-600">{t('party.lead')}</p>

      <div className="mt-7 space-y-4">
        {guests.map((guest, i) => (
          <GuestCard
            key={guest.id}
            primary={guest.primary}
            avatar={guest.primary ? 'Y' : `G${i + 1}`}
            name={
              guest.primary
                ? t('guest.primaryName')
                : `${t('guest.label')} ${i + 1}`
            }
            subtitle={guest.primary ? t('guest.primarySub') : t('guest.sub')}
            onRemove={() => removeGuest(guest.id)}
          />
        ))}

        <button
          type="button"
          onClick={addGuest}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-teal/40 py-4 font-medium text-teal transition-colors hover:border-teal hover:bg-mint/50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {t('guest.add')}
        </button>
      </div>

      <div className="mt-6">
        <InfoBox>{t('info.guests')}</InfoBox>
      </div>
    </div>
  )
}
