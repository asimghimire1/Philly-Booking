import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Accessible, scrollable modal. Bottom-sheet on mobile, centered dialog on
// desktop. Rendered in a portal so it isn't affected by layout overflow rules.
export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-2xl sm:rounded-3xl">
        {children}
      </div>
    </div>,
    document.body,
  )
}
