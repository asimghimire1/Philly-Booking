import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import BookingHeader from '../components/booking/BookingHeader.jsx'
import BookingFooter from '../components/booking/BookingFooter.jsx'
import { containerCls } from '../components/booking/container.js'
import { useBooking } from '../context/BookingContext.jsx'
import { useI18n } from '../i18n/LanguageContext.jsx'
import {
  basePrice,
  addonsPrice,
  selectionTotal,
  computeTip,
  confirmLabel,
  getAddon,
} from '../data/catalog.js'
import { findTherapistById, therapistLabel, useTherapists } from '../data/therapists.jsx'

const money = (n) => `$${n.toFixed(2)}`

// Square-hosted gift card purchase page.
const GIFT_URL = 'https://squareup.com/gift/KK448W6ER0JQG/order'

function Avatar({ text, primary }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${primary ? 'bg-teal' : 'bg-navy'
        }`}
    >
      {text}
    </span>
  )
}

function Row({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[15px]">
      <span className="text-slate-500">{label}</span>
      <span className={muted ? 'text-slate-400' : 'font-medium text-navy'}>
        {value}
      </span>
    </div>
  )
}

export default function ConfirmationPage() {
  const { guests, details, completed, bookingRef, resetBooking } = useBooking()
  const { therapists } = useTherapists()

  const { t, lang } = useI18n()
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [])

  // Reachable only after completing the booking — otherwise start over.
  if (!completed) return <Navigate to="/" replace />

  // A lone guest needs no explicit confirm, so count it like a confirmed one.
  const booked = guests.filter((g) => g.confirmed || guests.length === 1)
  const servicesTotal = booked.reduce((s, g) => s + basePrice(g.selection), 0)
  const addonsTotal = booked.reduce((s, g) => s + addonsPrice(g.selection), 0)
  const tip = computeTip(details, servicesTotal + addonsTotal)
  const total = servicesTotal + addonsTotal + tip
  const tipPct = ['20', '25', '30'].includes(details.tipMode)
    ? ` (${details.tipMode}%)`
    : ''

  const guestName = (g, i) =>
    g.primary ? t('confirm.you') : `${t('guest.label')} ${i + 1}`
  const avatar = (g, i) => (g.primary ? 'Y' : `G${i + 1}`)

  const subLine = (g) => {
    const raw = therapistLabel(g.therapist)
    const liveName = findTherapistById(therapists, g.therapist?.therapistId)?.name
    const thName =
      raw === 'female'
        ? t('therapist.female')
        : raw === 'male'
          ? t('therapist.male')
          : raw === 'none'
            ? t('therapist.noPref')
            : liveName || raw // a specific practitioner's name
    const addonNames = (g.selection.addonIds ?? []).map((id) => {
      const a = getAddon(id)
      return a?.free ? `${a.nameEn} ${t('confirm.free')}` : a?.nameEn
    })
    return addonNames.length ? `${thName} · + ${addonNames.join(', ')}` : thName
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white lg:overflow-x-visible">
      <BookingHeader innerClass={containerCls} />

      <div className="flex-1 py-10 sm:py-14">
        <div className="mx-auto grid w-full max-w-5xl gap-6 px-5 sm:px-8 lg:grid-cols-2 lg:gap-8">
          {/* Left: success + appointment details */}
          <div className="animate-rise min-w-0 space-y-6">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                <span className="animate-ring absolute inset-0 rounded-full bg-teal/30" />
                <svg className="animate-pop relative h-7 w-7" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h1 className="font-display text-3xl font-semibold text-navy">
                  {t('confirm.title')}
                </h1>
                <p className="mt-1 text-slate-500">{t('confirm.subtitle')}</p>
                <p className="mt-1.5 text-sm text-slate-400">{t('confirm.emailNote')}</p>
                {bookingRef && bookingRef.length > 0 && (
                  <p className="mt-1 text-sm text-slate-500">
                    Confirmation #{bookingRef.join(', #')}
                  </p>
                )}
              </div>
            </div>

            <div className="hover-lift rounded-2xl border border-slate-200 p-5">
              <p className="font-semibold text-navy">{t('confirm.details')}</p>

              <div className="mt-4 flex gap-3 rounded-xl bg-mint p-4">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-teal" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M12 8v4l2.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="min-w-0 text-sm text-slate-600 flex-1 space-y-2">
                  <div>
                    {booked.map((g, i) => {
                      const gLongDate = g.dateTime?.date ? new Intl.DateTimeFormat(locale, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }).format(g.dateTime.date) : ''
                      return (
                        <p key={g.id} className="text-slate-700 mt-1">
                          <span className="font-semibold text-navy">{guestName(g, i)}:</span>{' '}
                          {g.dateTime?.time ? `${gLongDate} · ${g.dateTime.time}` : gLongDate}
                        </p>
                      )
                    })}
                  </div>
                  <div className="border-t border-teal/10 pt-2">
                    <p className="text-xs text-slate-500">{t('confirm.address')}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{t('confirm.arrive')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-2 divide-y divide-slate-100">
                {booked.map((g, i) => (
                  <div key={g.id} className="flex items-center gap-3 py-3">
                    <Avatar text={avatar(g, i)} primary={g.primary} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-navy">
                        {guestName(g, i)} - {confirmLabel(g.selection, lang)}
                      </p>
                      <p className="truncate text-sm text-slate-500">{subLine(g)}</p>
                    </div>
                    <span className="shrink-0 font-medium text-navy">
                      {money(selectionTotal(g.selection))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: charge summary + gift card */}
          <div
            className="animate-rise min-w-0 space-y-6"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="hover-lift rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-navy">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                </svg>
                <h2 className="font-display text-lg font-semibold">
                  {t('summary.title')}
                </h2>
              </div>

              <div className="mt-4 space-y-2.5">
                <Row label={t('confirm.services')} value={money(servicesTotal)} />
                <Row label={t('confirm.addons')} value={money(addonsTotal)} />
                {tip > 0 && (
                  <Row label={`${t('details.tip')}${tipPct}`} value={money(tip)} />
                )}
              </div>

              <hr className="my-4 border-slate-100" />

              <div className="flex items-end justify-between">
                <span className="font-semibold text-navy">
                  {t('confirm.totalCharged')}
                </span>
                <span className="font-display text-2xl font-bold text-navy">
                  {money(total)}
                </span>
              </div>
            </div>

            <div className="hover-lift relative overflow-hidden rounded-2xl bg-linear-to-br from-navy to-teal p-6 text-white">
              {/* Sheen sweeping across the card to draw the eye to the CTA. */}
              <span className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/10" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t('gift.eyebrow')}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold">
                  {t('gift.title')}
                </h3>
                <p className="mt-2 text-sm text-white/80">{t('gift.desc')}</p>
                <a
                  href={GIFT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-all duration-200 hover:bg-white/90 hover:shadow-lg active:scale-[0.98]"
                >
                  <span className="transition-transform duration-200 group-hover:-rotate-12">
                    🎁
                  </span>
                  {t('gift.cta')}
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingFooter innerClass={containerCls} />
    </div>
  )
}
