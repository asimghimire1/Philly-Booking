import { useLocation } from 'react-router-dom'
import { steps, stepForPath } from '../components/booking/steps.js'
import { useI18n } from '../i18n/LanguageContext.jsx'
import BackButton from '../components/booking/BackButton.jsx'

// Stand-in for steps 4–5 so the flow is navigable while the earlier steps are
// fully built. Replace each with its real step UI.
export default function StepPlaceholder() {
  const { pathname } = useLocation()
  const { t } = useI18n()
  const current = stepForPath(pathname)
  const step = steps.find((s) => s.n === current)

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">
        {step ? t(`steps.${step.key}.label`) : ''}
      </h1>
      <p className="mt-3 text-slate-600">{t('placeholder.body')}</p>

      <BackButton />
    </div>
  )
}
