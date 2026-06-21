import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/LanguageContext.jsx'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-5xl font-bold text-slate-300">404</p>
      <h2 className="mt-4 font-display text-xl font-semibold text-navy">
        {t('notfound.title')}
      </h2>
      <Link
        to="/"
        className="mt-6 rounded-full bg-gradient-to-r from-navy to-teal px-5 py-2.5 text-sm font-semibold text-white"
      >
        {t('notfound.back')}
      </Link>
    </div>
  )
}
