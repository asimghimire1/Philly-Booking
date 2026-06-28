import { useEffect, useState } from 'react'

const TOAST_DURATION = 15000 // 15 seconds

let toastId = 0

/**
 * A floating toast that appears top-right and auto-dismisses.
 */
export default function Toast({ message, detail, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const show = setTimeout(() => setVisible(true), 50)
    // Auto-dismiss
    const hide = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss?.(), 300)
    }, TOAST_DURATION)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [onDismiss])

  return (
    <div
      className={`fixed right-4 top-4 z-[9999] max-w-sm transform transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}
    >
      <div className="rounded-xl border border-emerald-200 bg-white shadow-2xl shadow-navy/20">
        <div className="flex items-start gap-3 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg">
            🆕
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-navy">{message}</p>
            {detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}
          </div>
          <button
            onClick={() => { setVisible(false); setTimeout(() => onDismiss?.(), 300) }}
            className="-mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 overflow-hidden rounded-b-xl bg-emerald-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-[15000ms] ease-linear"
            style={{ width: visible ? '100%' : '0%' }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Simple toast manager hook.
 * Call `showToast(message, detail)` to fire one.
 */
let setGlobalToast = null

export function useToast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    setGlobalToast = (message, detail) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, message, detail }])
    }
    return () => { setGlobalToast = null }
  }, [])

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return {
    toasts,
    show: (message, detail) => setGlobalToast?.(message, detail),
    dismiss,
    ToastContainer: () => (
      <>
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} detail={t.detail} onDismiss={() => dismiss(t.id)} />
        ))}
      </>
    ),
  }
}
