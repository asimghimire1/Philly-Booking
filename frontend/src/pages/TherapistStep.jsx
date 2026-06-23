import { useBooking } from '../context/BookingContext.jsx'
import { useI18n } from '../i18n/LanguageContext.jsx'
import Pill from '../components/booking/Pill.jsx'
import SelectableCard from '../components/booking/SelectableCard.jsx'
import InfoBox from '../components/booking/InfoBox.jsx'
import BackButton from '../components/booking/BackButton.jsx'
import { useTherapists } from '../data/therapists.jsx'

function Avatar({ text, primary }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
        primary ? 'bg-teal' : 'bg-navy'
      }`}
    >
      {text}
    </span>
  )
}

const MODES = ['none', 'female', 'male', 'name']

function TherapistPicker({ guest, name, avatar, primary, showHeader }) {
  const { t, lang } = useI18n()
  const { setTherapistMode, setTherapist } = useBooking()
  const { therapists } = useTherapists()
  const pref = guest.therapist ?? { mode: 'none', therapistId: null }

  const modeLabel = {
    none: t('therapist.noPref'),
    female: t('therapist.female'),
    male: t('therapist.male'),
    name: t('therapist.pickByName'),
  }

  // Which staff to show. "No preference" shows no names — we'll match the guest.
  const visible =
    pref.mode === 'name'
      ? therapists
      : pref.mode === 'female' || pref.mode === 'male'
        ? therapists.filter((th) => th.gender === pref.mode)
        : []

  return (
    <div className="space-y-5">
      {showHeader && (
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar text={avatar} primary={primary} />
          <p className="font-semibold text-navy">{name}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <Pill
            key={m}
            active={pref.mode === m}
            onClick={() => setTherapistMode(guest.id, m)}
          >
            {modeLabel[m]}
          </Pill>
        ))}
      </div>

      {visible.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((th) => (
            <SelectableCard
              key={th.id}
              selected={pref.therapistId === th.id}
              onClick={() => setTherapist(guest.id, th.id)}
              title={th.name}
              desc={`${th.gender === 'male' ? t('therapist.male') : t('therapist.female')} · ${lang === 'zh' ? th.descZh : th.descEn}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TherapistStep() {
  const { guests, copyTherapistToAll } = useBooking()
  const { t, lang } = useI18n()

  const nameOf = (g, i) =>
    g.primary ? t('guest.primaryName') : `${t('guest.label')} ${i + 1}`
  const avatarOf = (g, i) => (g.primary ? 'Y' : `G${i + 1}`)
  const single = guests.length === 1

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">
        {t('therapist.title')}{' '}
        <span className="text-xl font-normal text-slate-400 sm:text-2xl">
          {t('therapist.titleAlt')}
        </span>
      </h1>
      {single && (
        <p className="mt-3 text-slate-600">
          {t('therapist.lead', { guest: nameOf(guests[0], 0) })}
        </p>
      )}

      <div className="mt-7 space-y-8">
        {guests.map((guest, i) => (
          <div key={guest.id} className="space-y-3">
            <TherapistPicker
              guest={guest}
              name={nameOf(guest, i)}
              avatar={avatarOf(guest, i)}
              primary={guest.primary}
              showHeader={!single}
            />
            {i === 0 && !single && (
              <div className="flex justify-end pr-2 -mt-2">
                <button
                  type="button"
                  onClick={copyTherapistToAll}
                  className="flex items-center gap-1.5 text-sm font-medium text-teal hover:text-teal-600 hover:underline"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {lang === 'zh' ? '应用到所有客人' : 'Apply to all guests'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-7">
        <InfoBox>{t('therapist.info')}</InfoBox>
      </div>

      <BackButton />
    </div>
  )
}
