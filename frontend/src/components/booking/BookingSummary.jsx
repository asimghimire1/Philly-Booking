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
  selectionMinutes,
} from '../../data/catalog.js'
import { findTherapistById, therapistLabel, useTherapists } from '../../data/therapists.jsx'
import { validatePartySchedule, formatScheduleError } from '../../utils/scheduleValidation.js'
import { isValidPhone } from '../../data/phoneCountries.js'

const money = (n) => `$${n.toFixed(2)}`

function Row({ label, value, muted, valueClass = '' }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[15px]">
      <span className="min-w-0 truncate text-slate-600">{label}</span>
      <span
        className={`shrink-0 ${muted ? 'text-slate-400' : valueClass || 'font-medium text-navy'
          }`}
      >
        {value}
      </span>
    </div>
  )
}

export default function BookingSummary() {
  const { guests, allConfirmed, details, unlockStep, completeBooking, submitting, submitError, submitErrorDetail, dateTimeConfiguring, dateTimeShortfall } =
    useBooking()
  const { therapists } = useTherapists()
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
  const fullPhone = details.phoneCode && details.phone
    ? `${details.phoneCode} ${details.phone.replace(/\D/g, '')}`
    : details.phone || ''
  const detailsValid =
    details.name.trim() &&
    isValidPhone(fullPhone) &&
    /\S+@\S+\.\S+/.test(details.email) &&
    details.waiver
  const servicesReady = single
    ? hasSelection(guests[0]?.selection)
    : allConfirmed
  const dateTimeReady = guests.every((g) => !counts(g) || g.dateTime?.time)
  const scheduleErrors = validatePartySchedule(guests, therapists, counts, selectionMinutes)
  const scheduleBlocked = scheduleErrors.length > 0
  const blocked =
    (currentStep === 2 && !servicesReady) ||
    (currentStep === 4 && (!dateTimeReady || dateTimeConfiguring || scheduleBlocked)) ||
    (currentStep === 5 && (!detailsValid || scheduleBlocked))
  const canContinue = (!!target || currentStep === 5) && !blocked && !submitting

  const footerText =
    currentStep === 2 && blocked
      ? t('services.pickEach')
      : currentStep === 3
        ? t('therapist.availability')
        : currentStep === 4
          ? dateTimeConfiguring
            ? lang === 'zh'
              ? '正在配置所有客人的时间...'
              : 'Configuring times for all guests...'
            : dateTimeShortfall > 0
              ? t('datetime.notEnoughSlots', { count: dateTimeShortfall })
              : scheduleBlocked
                ? formatScheduleError(scheduleErrors[0], t, lang)
                : blocked
                  ? t('datetime.pickTime')
                  : t('summary.holdNote')
          : currentStep === 5
            ? t('details.finalReview')
            : t('summary.disclaimer')

  const onContinue = async () => {
    if (target) {
      unlockStep(currentStep + 1) // allow forward navigation to the next step
      navigate(target)
    } else {
      const { success, error } = await completeBooking() // now actually saves to Supabase
      if (success) {
        navigate('/confirmation') // only navigates after the save attempt finishes
      } else if (error === 'SLOT_UNAVAILABLE') {
        navigate('/date-time') // send them back to pick a new time
      }
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
            {guests.map((g, i) => {
              if (!counts(g)) return null
              const gDateShort = g.dateTime?.date ? new Intl.DateTimeFormat(locale, {
                month: 'short',
                day: 'numeric',
              }).format(g.dateTime.date) : '-'
              const gTimeShort = g.dateTime?.time ? g.dateTime.time.replace(':00', '') : '-'
              return (
                <Row
                  key={g.id}
                  label={guests.length > 1 ? `${guestLabel(i)}` : t('summary.dateTimeRow')}
                  value={`${gDateShort} · ${gTimeShort}`}
                  muted={!g.dateTime?.time}
                />
              )
            })}
          </>
        ) : showSchedule ? (
          <>
            <Row label={t('summary.servicesAddons')} value={money(services)} />
            {guests.map((g, i) => {
              if (!counts(g)) return null
              const gDateShort = g.dateTime?.date ? new Intl.DateTimeFormat(locale, {
                month: 'short',
                day: 'numeric',
              }).format(g.dateTime.date) : '-'
              return (
                <div key={g.id} className="space-y-1 bg-white/40 p-2.5 rounded-lg border border-mint-200/50">
                  {guests.length > 1 && <p className="text-xs font-bold text-navy mb-1">{guestLabel(i)}</p>}
                  <Row label={t('summary.date')} value={gDateShort} />
                  <Row
                    label={t('summary.time')}
                    value={g.dateTime?.time ?? '-'}
                    muted={!g.dateTime?.time}
                  />
                </div>
              )
            })}
          </>
        ) : showBreakdown ? (
          guests.map((g, i) => {
            // Guests that aren't counted yet show no price.
            if (!counts(g)) {
              return <Row key={g.id} label={guestLabel(i)} value="-" muted />
            }
            const sel = g.selection
            const thLabel = therapistLabel(g.therapist)
            const thName = findTherapistById(therapists, g.therapist?.therapistId)?.name
            const thValue =
              thLabel === 'female' || thLabel === 'male'
                ? t(`therapist.${thLabel}`)
                : thLabel === 'none'
                  ? t('therapist.noPref')
                  : thName || thLabel
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
        disabled={!canContinue || submitting}
        onClick={onContinue}
        className={`group mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold text-white shadow-md transition-all duration-200 ${canContinue && !submitting
            ? 'bg-linear-to-r from-navy to-teal hover:opacity-95 hover:shadow-lg active:scale-[0.98]'
            : 'cursor-not-allowed bg-slate-300 shadow-none'
          }`}
      >
        {dateTimeConfiguring && currentStep === 4
          ? lang === 'zh'
            ? '配置中...'
            : 'Configuring...'
          : t('summary.continue')}
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

      {submitError && (
        <p className="mt-3 text-sm text-red-600">
          {submitError === 'SLOT_UNAVAILABLE'
            ? submitErrorDetail || t('summary.slotUnavailable')
            : submitError}
        </p>
      )}

      {scheduleBlocked && (currentStep === 4 || currentStep === 5) && (
        <div className="mt-3 space-y-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          {scheduleErrors.map((err, idx) => (
            <p key={idx}>{formatScheduleError(err, t, lang)}</p>
          ))}
        </div>
      )}

      <p className="mt-3 text-center text-xs text-slate-500">{footerText}</p>
    </div>
  )
}
