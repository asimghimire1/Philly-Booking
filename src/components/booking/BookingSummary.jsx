import { useLocation, useNavigate } from 'react-router-dom'
import { useBooking } from '../../context/BookingContext.jsx'
import { useI18n } from '../../i18n/LanguageContext.jsx'
import { stepForPath, nextPath } from './steps.js'
import {
  basePrice,
  selectionTotal,
  summaryLabel,
  getAddon,
  computeTip,
  hasSelection,
} from '../../data/catalog.js'
import { therapistLabel } from '../../data/therapists.js'

const money = (n) => `$${n.toFixed(2)}`

function Row({ label, value, muted, valueClass = '' }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[15px]">
      <span className="min-w-0 truncate text-slate-600">{label}</span>
      <span
        className={`shrink-0 ${
          muted ? 'text-slate-400' : valueClass || 'font-medium text-navy'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export default function BookingSummary() {
  const { guests, allConfirmed, dateTime, details, unlockStep, completeBooking } =
    useBooking()
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const currentStep = stepForPath(pathname)
  const showBreakdown = currentStep === 2 || currentStep === 3
  const showSchedule = currentStep === 4
  const showCheckout = currentStep === 5

  // A lone guest needs no explicit confirm — their live selection counts as soon
  // as it's valid. Multi-guest counts each guest on confirm.
  const single = guests.length === 1
  const counts = (g) => (single ? hasSelection(g.selection) : g.confirmed)

  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'
  const dateShort = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(dateTime.date)
  const timeShort = dateTime.time ? dateTime.time.replace(':00', '') : '-'

  // Only counted guests contribute - total starts at $0 and grows.
  const services = guests.reduce(
    (sum, g) => sum + (counts(g) ? selectionTotal(g.selection) : 0),
    0,
  )
  // Tip applies only once it's chosen on the details step.
  const tip = showCheckout ? computeTip(details, services) : 0
  const total = services + tip

  const tipPct =
    details.tipMode === '20' || details.tipMode === '25' || details.tipMode === '30'
      ? ` (${details.tipMode}%)`
      : ''

  // Per-step Continue gating.
  const target = nextPath(currentStep)
  const detailsValid =
    details.name.trim() &&
    details.phone.trim() &&
    /\S+@\S+\.\S+/.test(details.email) &&
    details.waiver
  const servicesReady = single
    ? hasSelection(guests[0]?.selection)
    : allConfirmed
  const blocked =
    (currentStep === 2 && !servicesReady) ||
    (currentStep === 4 && !dateTime.time) ||
    (currentStep === 5 && !detailsValid)
  const canContinue = (!!target || currentStep === 5) && !blocked

  const footerText =
    currentStep === 2 && blocked
      ? t('services.pickEach')
      : currentStep === 3
        ? t('therapist.availability')
        : currentStep === 4
          ? blocked
            ? t('datetime.pickTime')
            : t('summary.holdNote')
          : currentStep === 5
            ? t('details.finalReview')
            : t('summary.disclaimer')

  const onContinue = () => {
    if (target) {
      unlockStep(currentStep + 1) // allow forward navigation to the next step
      navigate(target)
    } else {
      completeBooking() // unlock the confirmation page
      navigate('/confirmation')
    }
  }

  const guestLabel = (i) => `${t('guest.label')} ${i + 1}`

  return (
    <div className="rounded-2xl bg-mint p-6">
      <div className="flex items-center gap-2 text-navy">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        </svg>
        <h2 className="font-display text-lg font-semibold">{t('summary.title')}</h2>
      </div>

      <div className="mt-5 space-y-3">
        {showCheckout ? (
          <>
            <Row label={t('summary.servicesAddons')} value={money(services)} />
            {tip > 0 && (
              <Row label={`${t('details.tip')}${tipPct}`} value={money(tip)} />
            )}
            <Row
              label={t('summary.dateTimeRow')}
              value={`${dateShort} · ${timeShort}`}
            />
          </>
        ) : showSchedule ? (
          <>
            <Row label={t('summary.servicesAddons')} value={money(services)} />
            <Row label={t('summary.date')} value={dateShort} />
            <Row
              label={t('summary.time')}
              value={dateTime.time ?? '-'}
              muted={!dateTime.time}
            />
          </>
        ) : showBreakdown ? (
          guests.map((g, i) => {
            // Guests that aren't counted yet show no price.
            if (!counts(g)) {
              return <Row key={g.id} label={guestLabel(i)} value="-" muted />
            }
            const sel = g.selection
            const thLabel = therapistLabel(g.therapist)
            const thValue =
              thLabel === 'female' || thLabel === 'male'
                ? t(`therapist.${thLabel}`)
                : thLabel === 'none'
                  ? t('therapist.noPref')
                  : thLabel
            return (
              <div key={g.id} className="space-y-1.5">
                <Row
                  label={`${guestLabel(i)} · ${summaryLabel(sel)}`}
                  value={money(basePrice(sel))}
                />
                {sel.addonIds.map((aid) => {
                  const a = getAddon(aid)
                  if (!a) return null
                  return (
                    <Row
                      key={aid}
                      label={a.nameEn}
                      value={a.free ? t('services.free') : `+${money(a.price)}`}
                      valueClass={
                        a.free
                          ? 'font-medium text-emerald-600'
                          : 'font-medium text-navy'
                      }
                    />
                  )
                })}
                {currentStep >= 3 && (
                  <Row label={t('summary.therapist')} value={thValue} />
                )}
              </div>
            )
          })
        ) : (
          <>
            <Row
              label={t('summary.guests')}
              value={
                lang === 'zh'
                  ? `${guests.length} 位客人`
                  : `${guests.length} ${guests.length === 1 ? 'guest' : 'guests'}`
              }
            />
            <Row label={t('summary.services')} value="-" muted />
            <Row label={t('summary.dateTime')} value="-" muted />
          </>
        )}
      </div>

      <hr className="my-5 border-mint-200" />

      <Row label={t('summary.subtotal')} value={money(total)} />

      <div className="mt-4 flex items-end justify-between">
        <span className="text-lg font-semibold text-navy">{t('summary.total')}</span>
        <span className="font-display text-3xl font-bold text-navy">
          {money(total)}
        </span>
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className={`group mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold text-white shadow-md transition-all duration-200 ${
          canContinue
            ? 'bg-gradient-to-r from-navy to-teal hover:opacity-95 hover:shadow-lg active:scale-[0.98]'
            : 'cursor-not-allowed bg-slate-300 shadow-none'
        }`}
      >
        {t('summary.continue')}
        <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">{footerText}</p>
    </div>
  )
}
