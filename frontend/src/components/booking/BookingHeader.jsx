import logo from '../../assets/Images/logo.png'
import LangToggle from './LangToggle.jsx'
import { useI18n } from '../../i18n/LanguageContext.jsx'

export default function BookingHeader({ innerClass = '' }) {
  const { t } = useI18n()
  const navLinks = [
    { key: 'nav.services' },
    { key: 'nav.about' },
    { key: 'nav.contact' },
  ]

  return (
    <header className="border-b border-slate-100">
      <div
        className={`${innerClass} flex items-center justify-between gap-3 py-4 sm:py-5`}
      >
        <a href="/" className="flex min-w-0 items-center gap-2.5">
          <img
            src={logo}
            alt="Pain Away of Philly"
            className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
          />
          <span className="truncate font-display text-base font-semibold text-navy sm:text-xl">
            Pain Away of Philly
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <nav className="hidden items-center gap-7 text-[15px] text-slate-600 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href="#"
                className="transition-colors hover:text-navy"
              >
                {t(link.key)}
              </a>
            ))}
          </nav>
          <LangToggle />
        </div>
      </div>
    </header>
  )
}
