import { useI18n } from '../../i18n/LanguageContext.jsx'

// EN / 中文 toggle — drives the whole UI language via LanguageContext.
export default function LangToggle({ className = '' }) {
  const { lang, setLang } = useI18n()
  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'zh', label: '中文' },
  ]

  return (
    <div
      className={`flex items-center rounded-full bg-slate-100 p-0.5 text-sm font-medium ${className}`}
    >
      {langs.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={`rounded-full px-3 py-1 transition-colors ${
            lang === l.code
              ? 'bg-navy text-white'
              : 'text-slate-500 hover:text-navy'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
