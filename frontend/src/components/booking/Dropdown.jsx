import { useEffect, useRef, useState } from 'react'

// A styled dropdown that replaces the default browser <select> so combo slots
// match the rest of the booking UI. Opens a floating, scrollable option list
// with a teal-highlighted current choice; closes on outside click or Escape.
export default function Dropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = options.find((o) => o.id === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm transition-all duration-200 ${
          open
            ? 'border-teal ring-2 ring-teal/20'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span
          className={`min-w-0 truncate ${
            selected ? 'font-medium text-navy' : 'text-slate-400'
          }`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="animate-fade absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-navy/10"
        >
          {options.map((o) => {
            const active = o.id === value
            return (
              <li key={o.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                    active
                      ? 'bg-teal/10 font-medium text-teal'
                      : 'text-navy hover:bg-mint'
                  }`}
                >
                  <span className="min-w-0 truncate">{o.label}</span>
                  {active && (
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
