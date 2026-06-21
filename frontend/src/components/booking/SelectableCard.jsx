// Radio-style selectable card for techniques, fixed services, and add-ons.
// With `readOnly` it renders as a non-interactive info card (no radio).
export default function SelectableCard({
  selected,
  onClick,
  title,
  desc,
  priceLabel,
  priceFree,
  readOnly,
}) {
  const inner = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium text-navy">{title}</p>
        {desc && <p className="mt-0.5 text-sm text-slate-500">{desc}</p>}
        {priceLabel && (
          <p
            className={`mt-1 text-sm font-semibold ${
              priceFree ? 'text-emerald-600' : 'text-teal'
            }`}
          >
            {priceLabel}
          </p>
        )}
      </div>

      {!readOnly && (
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

  if (readOnly) {
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left">
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
