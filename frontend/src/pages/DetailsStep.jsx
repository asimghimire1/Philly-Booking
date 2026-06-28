import { useState } from 'react'
import { useBooking } from '../context/BookingContext.jsx'
import { useI18n } from '../i18n/LanguageContext.jsx'
import { selectionTotal, hasSelection } from '../data/catalog.js'
import Pill from '../components/booking/Pill.jsx'
import InfoBox from '../components/booking/InfoBox.jsx'
import BackButton from '../components/booking/BackButton.jsx'
import WaiverModal from '../components/booking/WaiverModal.jsx'
import SquareCardForm from '../components/booking/SquareCardForm.jsx'
import { phoneCountries, isValidPhone, detectPhoneCode, combinePhone } from '../data/phoneCountries.js'

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-navy outline-none transition-colors placeholder:text-slate-400 focus:border-teal'

function Label({ children, optional }) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-slate-600">
      {children}
      {optional && <span className="ml-1 text-slate-400">({optional})</span>}
    </span>
  )
}

function RadioDot({ selected }) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? 'border-teal' : 'border-slate-300'
      }`}
    >
      {selected && <span className="h-2.5 w-2.5 rounded-full bg-teal" />}
    </span>
  )
}

export default function DetailsStep() {
  const { guests, details, patchDetails, submitting, cardTokenizeRef } = useBooking()
  const { t, lang } = useI18n()
  const [waiverOpen, setWaiverOpen] = useState(false)

  const fullPhone = details.phoneCode && details.phone
    ? `${details.phoneCode} ${details.phone.replace(/\D/g, '')}`
    : details.phone || ''
  const phoneValid = !fullPhone || isValidPhone(fullPhone)
  const [phoneTouched, setPhoneTouched] = useState(false)

  const tipOptions = [
    { id: '20', label: '20%' },
    { id: '25', label: '25%' },
    { id: '30', label: '30%' },
    { id: 'custom', label: t('details.tipCustom') },
    { id: 'later', label: t('details.tipLater') },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">
        {t('details.title')}{' '}
        <span className="text-xl font-normal text-slate-400 sm:text-2xl">
          {t('details.titleAlt')}
        </span>
      </h1>
      <p className="mt-3 text-slate-600">{t('details.lead')}</p>

      <div className="mt-7 space-y-6">
        {/* Contact */}
        <label className="block">
          <Label>{t('details.fullName')}</Label>
          <input
            className={inputCls}
            value={details.name}
            onChange={(e) => patchDetails({ name: e.target.value })}
            placeholder={t('details.fullNamePh')}
            autoComplete="name"
          />
        </label>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Country code dropdown */}
          <label className="block">
            <Label>{lang === 'zh' ? '国家/地区' : 'Country'}</Label>
            <select
              className={inputCls}
              value={details.phoneCode === '' ? '' : (details.phoneCode || '+86')}
              onChange={(e) => patchDetails({ phoneCode: e.target.value })}
            >
              {phoneCountries.map((c) => (
                <option key={c.code || 'other'} value={c.code}>
                  {c.code ? `${c.name} ${c.code}` : c.label}
                </option>
              ))}
            </select>
          </label>
          {/* Phone number input */}
          <label className="block">
            <Label>{t('details.phone')}</Label>
            <input
              className={`${inputCls} ${phoneTouched && !phoneValid ? 'border-rose-300 focus:border-rose-500' : ''}`}
              value={details.phone}
              onChange={(e) => patchDetails({ phone: e.target.value.replace(/[^\d\s\-]/g, '') })}
              onBlur={() => setPhoneTouched(true)}
              placeholder={t('details.phonePh')}
              inputMode="numeric"
              autoComplete="tel-national"
            />
            {phoneTouched && !phoneValid && (
              <p className="mt-1 text-xs text-rose-500">
                {lang === 'zh' ? '请输入有效的电话号码' : 'Enter a valid phone number'}
              </p>
            )}
          </label>
        </div>

        {/* Email — full width below country+phone */}
        <label className="block">
          <Label>{t('details.email')}</Label>
          <input
            className={inputCls}
            value={details.email}
            onChange={(e) => patchDetails({ email: e.target.value })}
            placeholder={t('details.emailPh')}
            inputMode="email"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <Label optional={t('details.optional')}>{t('details.note')}</Label>
          <textarea
            className={`${inputCls} min-h-[88px] resize-y`}
            value={details.note}
            onChange={(e) => patchDetails({ note: e.target.value })}
            placeholder={t('details.notePh')}
          />
        </label>

        {/* Payment */}
        <div>
          <Label>{t('details.payment')}</Label>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => patchDetails({ payment: 'prepay' })}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                details.payment === 'prepay'
                  ? 'border-teal bg-teal/5'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <RadioDot selected={details.payment === 'prepay'} />
              <span>
                <span className="block font-semibold text-navy">
                  {t('details.prepayTitle')}
                </span>
                <span className="mt-0.5 block text-sm text-slate-500">
                  {t('details.prepayDesc')}
                </span>
              </span>
            </button>

            {details.payment === 'prepay' && (
              <div className="space-y-3">
                <InfoBox>{t('details.prepayInfo')}</InfoBox>
                {/* Square Web Payments card form */}
                <SquareCardForm
                  onTokenReady={(fn) => { cardTokenizeRef.current = fn }}
                  disabled={submitting}
                />

                {/* Tip — only when prepaying; paying at the store skips it. */}
                <div>
                  <Label>{t('details.tipLabel')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {tipOptions.map((opt) => (
                      <Pill
                        key={opt.id}
                        active={details.tipMode === opt.id}
                        onClick={() => patchDetails({ tipMode: opt.id })}
                      >
                        {opt.label}
                      </Pill>
                    ))}
                  </div>
                  {details.tipMode === 'custom' && (
                    <div className="relative mt-3 max-w-[12rem]">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        className={`${inputCls} pl-8`}
                        value={details.tipCustom}
                        onChange={(e) =>
                          patchDetails({ tipCustom: e.target.value.replace(/[^0-9.]/g, '') })
                        }
                        onBlur={(e) => {
                          const servicesTotal = guests.reduce((s, g) => s + (hasSelection(g.selection) ? selectionTotal(g.selection) : 0), 0)
                          const maxTip = Math.min(servicesTotal, 100000)
                          const num = parseFloat(e.target.value) || 0
                          if (num > maxTip) {
                            patchDetails({ tipCustom: String(maxTip) })
                          }
                        }}
                        placeholder={t('details.tipCustomPh')}
                        inputMode="decimal"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => patchDetails({ payment: 'visit' })}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                details.payment === 'visit'
                  ? 'border-teal bg-teal/5'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <RadioDot selected={details.payment === 'visit'} />
              <span>
                <span className="block font-semibold text-navy">
                  {t('details.payVisitTitle')}
                </span>
                <span className="mt-0.5 block text-sm text-slate-500">
                  {t('details.payVisitDesc')}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Waiver */}
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={details.waiver}
            onChange={(e) => patchDetails({ waiver: e.target.checked })}
            className="mt-0.5 h-5 w-5 shrink-0 accent-teal"
          />
          <span className="text-sm text-slate-600">
            {t('details.waiver')}{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setWaiverOpen(true)
              }}
              className="font-medium text-teal hover:underline"
            >
              {t('details.terms')}
            </button>
          </span>
        </label>
      </div>

      <BackButton />

      <WaiverModal open={waiverOpen} onClose={() => setWaiverOpen(false)} />
    </div>
  )
}
