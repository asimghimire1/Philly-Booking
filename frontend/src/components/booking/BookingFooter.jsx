import { useState } from 'react'
import logo from '../../assets/Images/logo.png'
import { useI18n } from '../../i18n/LanguageContext.jsx'
import WaiverModal from './WaiverModal.jsx'

export default function BookingFooter({ innerClass = '' }) {
  const { t } = useI18n()
  const [termsOpen, setTermsOpen] = useState(false)

  // Terms opens the full Informed Consent & Liability Waiver; the rest are
  // plain placeholder links until those pages exist.
  const footerLinks = [
    { key: 'footer.privacy', href: '#' },
    { key: 'footer.terms', onClick: () => setTermsOpen(true) },
    { key: 'footer.faq', href: '#' },
  ]

  return (
    <footer className="bg-navy text-white">
      <div
        className={`${innerClass} flex flex-col gap-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:py-8`}
      >
        <div className="group flex items-start gap-3">
          <img
            src={logo}
            alt=""
            className="h-8 w-8 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105"
          />
          <div>
            <p className="font-display text-base font-semibold">
              Pain Away of Philly
            </p>
            <p className="mt-0.5 text-sm text-white/60">{t('footer.address')}</p>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm text-white/70">
          {footerLinks.map(({ key, href, onClick }) =>
            onClick ? (
              <button
                key={key}
                type="button"
                onClick={onClick}
                className="relative transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all after:duration-300 hover:text-white hover:after:w-full"
              >
                {t(key)}
              </button>
            ) : (
              <a
                key={key}
                href={href}
                className="relative transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all after:duration-300 hover:text-white hover:after:w-full"
              >
                {t(key)}
              </a>
            ),
          )}
        </nav>
      </div>

      <WaiverModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </footer>
  )
}
