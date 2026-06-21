import { useI18n } from '../../i18n/LanguageContext.jsx'

export default function GuestCard({ avatar, name, subtitle, primary, onRemove }) {
  const { t } = useI18n()

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
          primary ? 'bg-teal' : 'bg-navy'
        }`}
      >
        {avatar}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-navy">{name}</p>
        <p className="truncate text-sm text-slate-500">{subtitle}</p>
      </div>

      {primary ? (
        <span className="rounded-full bg-teal/10 px-3 py-1 text-sm font-medium text-teal">
          {t('guest.youPill')}
        </span>
      ) : (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${t('guest.remove')} ${name}`}
          className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
