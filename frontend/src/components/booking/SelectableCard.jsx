// Radio-style selectable card for techniques, fixed services, and add-ons.
// With `readOnly` it renders as a non-interactive info card (no radio).
// With `disabled` it renders as a non-interactive card with disabled styling.
export default function SelectableCard({
  selected,
  onClick,
  title,
  desc,
  priceLabel,
  priceFree,
  readOnly,
  disabled,
}) {
  const inner = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={`font-medium ${disabled ? 'text-slate-400' : 'text-navy'}`}>{title}</p>
        {desc && <p className={`mt-0.5 text-sm ${disabled ? 'text-slate-300' : 'text-slate-500'}`}>{desc}</p>}
        {priceLabel && (
          <p
            className={`mt-1 text-sm font-semibold ${
              priceFree ? 'text-emerald-600' : disabled ? 'text-slate-400' : 'text-teal'
            }`}
          >
            {priceLabel}
          </p>
        )}
      </div>

      {!readOnly && !disabled && (
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            selected ? 'border-teal' : 'border-slate-300'
          }`}
        >
          {selected && <span className="h-2.5 w-2.5 rounded-full bg-teal" />}
        </span>
      )}
    </div>
  )

  if (readOnly || disabled) {
    return (
      <div className={`w-full rounded-2xl border p-4 text-left ${
        disabled ? 'border-slate-200 bg-slate-50/60' : 'border-slate-200 bg-slate-50/60'
      }`}>
        {inner}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.99] ${
        selected
          ? 'border-teal bg-teal/5'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {inner}
    </button>
  )
}
