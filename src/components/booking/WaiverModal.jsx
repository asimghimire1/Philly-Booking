import Modal from './Modal.jsx'
import { useI18n } from '../../i18n/LanguageContext.jsx'

// Numbered clause with a small circular badge.
function Clause({ n, children }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10 text-xs font-semibold text-teal">
        {n}
      </span>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </li>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="border-b border-slate-100 pb-2 font-display text-lg font-semibold text-navy">
        {title}
      </h3>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  )
}

const B = ({ children }) => <strong className="font-semibold text-navy">{children}</strong>

// Informed Consent & Liability Waiver. Legal copy is kept in English; have it
// professionally translated before relying on a Chinese version.
export default function WaiverModal({ open, onClose }) {
  const { t } = useI18n()

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex justify-center pt-3 sm:hidden">
        <span className="h-1.5 w-10 rounded-full bg-slate-200" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4 sm:py-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal">
            Pain Away of Philly
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold text-navy sm:text-2xl">
            Informed Consent &amp; Liability Waiver
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Please read carefully before completing your booking.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 space-y-7 overflow-y-auto px-6 py-5">
        <div className="rounded-2xl border-l-4 border-teal bg-mint p-4 text-sm leading-relaxed text-slate-600">
          Your health, comfort, and experience are our highest priority. We want
          you to leave feeling refreshed and well cared for. Please read this form
          carefully and ask us any questions before you agree to it.
        </div>

        <Section title="Consent & Understanding">
          <ol className="space-y-3">
            <Clause n={1}>
              I voluntarily give my consent to receive <B>massage therapy</B> and,
              where applicable, traditional Chinese medicine treatments such as
              tui-na and cupping.
            </Clause>
            <Clause n={2}>
              Therapeutic massage and bodywork are <B>not a substitute</B> for
              medical examination, diagnosis, or treatment, and are not a
              replacement for any care prescribed by a physician.
            </Clause>
            <Clause n={3}>
              My therapist does not diagnose illness or injury and does not
              prescribe medications.
            </Clause>
            <Clause n={4}>
              I understand the normal effects and risks of these treatments,
              including but not limited to:
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>
                  Temporary muscle soreness or tenderness, particularly after
                  tui-na or deep-tissue work. This typically resolves within a few
                  days.
                </li>
                <li>
                  Temporary circular marks or discoloration on the skin where cups
                  are placed during cupping. These marks are normal, generally
                  painless, and usually fade within a few days.
                </li>
                <li>Superficial bruising.</li>
                <li>
                  The possibility that a pre-existing or undiscovered condition or
                  injury could be aggravated.
                </li>
              </ul>
            </Clause>
            <Clause n={5}>
              I have been given the opportunity to <B>disclose any health
              conditions</B>, allergies, injuries, surgeries, medications, or other
              concerns. It is my responsibility to do so before my session and
              report any changes before future sessions.
            </Clause>
            <Clause n={6}>
              I understand that additional risks may apply based on my physical
              condition, and that some treatments may not be recommended{' '}
              <B>during pregnancy</B> or with certain conditions.
            </Clause>
            <Clause n={7}>
              It is my responsibility to tell my therapist about any{' '}
              <B>discomfort during the session</B> so the pressure or technique can
              be adjusted. I may ask to stop at any time.
            </Clause>
            <Clause n={8}>
              I understand that either I or my therapist may{' '}
              <B>end the session at any time</B>.
            </Clause>
            <Clause n={9}>
              I have had the opportunity to ask questions about the treatments I
              will receive, and my questions have been answered to my satisfaction.
            </Clause>
            <Clause n={10}>
              This consent and waiver applies to{' '}
              <B>this session and all future sessions</B> I receive, unless and
              until I revoke it in writing.
            </Clause>
          </ol>
        </Section>

        <Section title="Release">
          <p>
            Understanding the normal effects described above, and having been given
            the opportunity to disclose any relevant health information, I{' '}
            <B>release and hold harmless</B> the company and my individual therapist
            from claims arising out of the ordinary risks inherent in the
            treatments I have consented to receive.
          </p>
          <p>
            This release <B>does not apply</B> to gross negligence or intentional
            misconduct.
          </p>
        </Section>

        <Section title="Sharing Health Concerns">
          <p>
            <B>Please tell your therapist or leave a note when you book</B> if you
            have any health conditions, medications (such as blood thinners),
            allergies, injuries, recent surgery, or are or may be pregnant.
          </p>
          <p>
            Sharing this information is voluntary, but it helps us care for you
            safely and decide whether certain treatments — such as cupping — are
            right for you today.
          </p>
        </Section>

        <Section title="Acknowledgment">
          <div className="flex gap-3">
            <span className="text-lg leading-none">📱</span>
            <p>
              <B>Booking online:</B> By checking the acknowledgment box and
              completing your booking, you confirm that you have read, understand,
              and agree to this waiver. This action serves as your{' '}
              <B>electronic signature</B>.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-lg leading-none">✍️</span>
            <p>
              <B>Signing in person:</B> You have read this form, or had it read to
              you, and you understand and agree to it. You are signing voluntarily.
            </p>
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-navy py-3 font-semibold text-white transition-colors hover:bg-navy-600"
        >
          {t('details.waiverCta')}
        </button>
      </div>
    </Modal>
  )
}
