import { useState } from 'react'
import { useBooking } from '../context/BookingContext.jsx'
import { useI18n } from '../i18n/LanguageContext.jsx'
import Pill from '../components/booking/Pill.jsx'
import InfoBox from '../components/booking/InfoBox.jsx'
import BackButton from '../components/booking/BackButton.jsx'
import WaiverModal from '../components/booking/WaiverModal.jsx'

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
  const { details, patchDetails } = useBooking()
  const { t, lang } = useI18n()
  const [waiverOpen, setWaiverOpen] = useState(false)

  const PHONE_RE = /^[\d\s\-\(\)\+]{7,20}$/
  const phoneValid = !details.phone || PHONE_RE.test(details.phone.trim())
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
          <label className="block">
            <Label>{t('details.phone')}</Label>
            <input
              className={`${inputCls} ${phoneTouched && !phoneValid ? 'border-rose-300 focus:border-rose-500' : ''}`}
              value={details.phone}
              onChange={(e) => patchDetails({ phone: e.target.value })}
              onBlur={() => setPhoneTouched(true)}
              placeholder={t('details.phonePh')}
              inputMode="tel"
              autoComplete="tel"
            />
            {phoneTouched && !phoneValid && (
              <p className="mt-1 text-xs text-rose-500">
                {lang === 'zh' ? '请输入有效的电话号码' : 'Enter a valid phone number'}
              </p>
            )}
          </label>
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
        </div>

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
                {/* Visual placeholder — Square fields wired with the backend. */}
                <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                  <label className="block">
                    <Label>{t('details.cardNumber')}</Label>
                    <input className={inputCls} placeholder="1234 5678 9012 3456" inputMode="numeric" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <Label>{t('details.expiry')}</Label>
                      <input className={inputCls} placeholder="MM / YY" />
                    </label>
                    <label className="block">
                      <Label>{t('details.cvc')}</Label>
                      <input className={inputCls} placeholder="123" inputMode="numeric" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                      {t('details.securedBy')}
                    </span>
                    <span className="flex gap-1.5">
                      {['VISA', 'MC', 'AMEX'].map((c) => (
                        <span key={c} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                          {c}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>

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
