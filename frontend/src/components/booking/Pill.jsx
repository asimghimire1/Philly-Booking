// Rounded pill used for the Single/Combo toggle and category/duration choices.
// Selected state uses the teal accent (brief: teal = selected states).
export default function Pill({ active, onClick, children, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
        active
          ? 'border-teal bg-teal text-white shadow-sm'
          : disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
            : 'border-slate-200 bg-white text-navy hover:border-teal/50'
      }`}
    >
      {children}
    </button>
  )
}
