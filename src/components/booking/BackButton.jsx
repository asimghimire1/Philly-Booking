import { useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/LanguageContext.jsx'
import { stepForPath, prevPath } from './steps.js'

// Goes one step back in the flow (not straight to the start).
export default function BackButton() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t } = useI18n()

  const prev = prevPath(stepForPath(pathname))
  if (!prev) return null

  return (
    <button
      type="button"
      onClick={() => navigate(prev)}
      className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-slate-50"
    >
      ← {t('common.back')}
    </button>
  )
}
