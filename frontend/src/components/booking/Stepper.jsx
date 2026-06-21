import { Fragment } from 'react'
import { steps } from './steps.js'
import { useI18n } from '../../i18n/LanguageContext.jsx'

function CheckIcon() {
  return (
    <svg className="h-4 w-4 sm:h-[18px] sm:w-[18px]" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Stepper({ currentStep = 1 }) {
  const { t } = useI18n()

  return (
    <nav aria-label="Booking progress">
      <ol className="flex items-start">
        {steps.map((step, i) => {
          const status =
            step.n < currentStep
              ? 'done'
              : step.n === currentStep
                ? 'active'
                : 'upcoming'
          const isLast = i === steps.length - 1
          const label = t(`steps.${step.key}.label`)
          const short = t(`steps.${step.key}.short`)

          return (
            <Fragment key={step.n}>
              {/* Equal, shrinkable column — never forces horizontal overflow. */}
              <li className="flex min-w-0 flex-1 flex-col items-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:h-9 sm:w-9 sm:text-sm ${
                    status === 'active'
                      ? 'bg-navy text-white'
                      : status === 'done'
                        ? 'bg-teal text-white'
                        : 'border border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {status === 'done' ? <CheckIcon /> : step.n}
                </span>
                <span
                  title={label}
                  className={`mt-1.5 w-full truncate px-0.5 text-center text-[10px] leading-tight sm:text-xs ${
                    status === 'active'
                      ? 'font-semibold text-navy'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{label}</span>
                </span>
              </li>

              {!isLast && (
                <li
                  aria-hidden="true"
                  className={`mt-3.5 h-0.5 w-3 shrink-0 sm:mt-[18px] sm:w-auto sm:flex-1 ${
                    step.n < currentStep ? 'bg-teal' : 'bg-slate-200'
                  }`}
                />
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
