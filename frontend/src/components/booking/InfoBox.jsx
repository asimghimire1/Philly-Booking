export default function InfoBox({ children }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-mint p-4 text-sm text-slate-600">
      <svg
        className="mt-0.5 h-5 w-5 shrink-0 text-teal"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 11v5M12 8h.01"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <p className="leading-relaxed">{children}</p>
    </div>
  )
}
