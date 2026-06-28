// Small presentational building blocks shared across the admin pages, styled to
// match the brand palette (navy / teal / mint) used in the booking flow.

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${className}`}>
      {children}
    </div>
  )
}

export function PageHeading({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, sublabel, icon, tone = 'teal' }) {
  const tones = {
    teal: 'bg-teal/10 text-teal',
    navy: 'bg-navy/10 text-navy',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-500',
  }
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${tones[tone]}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-navy">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}
    </Card>
  )
}

const STATUS_STYLES = {
  upcoming: 'bg-teal/10 text-teal',
  unresolved: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-600',
  cancelled: 'bg-rose-100 text-rose-500',
}

// Get current datetime for comparison
function nowIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}T${h}:${min}`
}

export function StatusBadge({ status, date, time }) {
  // Compute effective status: if upcoming but time has passed, show as unresolved
  const now = nowIso()
  const effectiveStatus = (status === 'upcoming' && date + 'T' + time < now) ? 'unresolved' : status
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        STATUS_STYLES[effectiveStatus] ?? 'bg-slate-100 text-slate-500'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {effectiveStatus}
    </span>
  )
}

// Distinct, human-readable payment status as the practice sees it.
export const paymentLabel = (p) =>
  p === 'prepay' ? 'Paid in advance' : p === 'visit' ? 'Pay in store' : p

// Shows the actual payment_status when available, else falls back to payment method.
function statusConfig(paymentStatus) {
  if (paymentStatus === 'completed') return { label: 'Paid', cls: 'bg-emerald-100 text-emerald-700', icon: 'check' }
  if (paymentStatus === 'pending') return { label: 'Pending', cls: 'bg-amber-100 text-amber-700', icon: 'clock' }
  if (paymentStatus === 'failed') return { label: 'Failed', cls: 'bg-rose-100 text-rose-700', icon: 'x' }
  return null
}

export function PaymentBadge({ payment, paymentStatus }) {
  const s = statusConfig(paymentStatus)
  if (s) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>
        {s.icon === 'check' ? (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : s.icon === 'clock' ? (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
        {s.label}
      </span>
    )
  }

  const prepaid = payment === 'prepay'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        prepaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {prepaid ? (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <path d="M5 9l1-4h12l1 4M5 9v9a1 1 0 001 1h12a1 1 0 001-1V9M5 9h14M9 19v-5h6v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {paymentLabel(payment)}
    </span>
  )
}

export function Initials({ name, className = '' }) {
  const text = (name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white ${className}`}
    >
      {text}
    </span>
  )
}

export const fieldCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-colors placeholder:text-slate-400 focus:border-teal'

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}

// Brand date formatting, e.g. "Thu, Jun 18".
export function fmtDate(isoStr) {
  if (!isoStr) return '';
  const datePart = String(isoStr).split(/T|\s/)[0];
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export const money = (n) => `$${Number(n || 0).toFixed(2)}`
