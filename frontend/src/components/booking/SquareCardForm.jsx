import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/LanguageContext.jsx'

const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APPLICATION_ID
const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID

export default function SquareCardForm({ onTokenReady, disabled }) {
  const { t, lang } = useI18n()
  const cardRef = useRef(null)
  const paymentsRef = useRef(null)
  const cardInstanceRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const initCard = async () => {
      try {
        if (!SQUARE_APP_ID) {
          setError('Square Application ID not configured')
          return
        }

        // Wait for Square SDK to be ready
        while (!window.Square) {
          await new Promise((r) => setTimeout(r, 200))
        }

        if (cancelled) return

        const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID)
        paymentsRef.current = payments

        const card = await payments.card()
        cardInstanceRef.current = card

        if (cancelled) { card.destroy?.(); return }

        // Clear container before attaching (handles StrictMode double-mount orphan iframes)
        if (cardRef.current) cardRef.current.innerHTML = ''

        await card.attach(cardRef.current)
        if (!cancelled) setLoaded(true)
      } catch (err) {
        if (!cancelled) {
          console.error('Square init error:', err)
          setError(err.message || 'Failed to load payment form')
        }
      }
    }

    initCard()

    return () => {
      cancelled = true
      if (cardInstanceRef.current) {
        cardInstanceRef.current.destroy?.().catch(() => {})
        cardInstanceRef.current = null
      }
    }
  }, [])

  const handleTokenize = async () => {
    if (!cardInstanceRef.current) return null
    try {
      const result = await cardInstanceRef.current.tokenize()
      if (result.status === 'OK') {
        return result.token
      }
      setError(result.errors?.[0]?.message || 'Card information is invalid')
      return null
    } catch (err) {
      setError(err.message || 'Tokenization failed')
      return null
    }
  }

  // Expose tokenize method to parent
  useEffect(() => {
    if (onTokenReady) {
      onTokenReady(handleTokenize)
    }
  }, [loaded, onTokenReady])

  return (
    <div className="space-y-3">
      <div
        ref={cardRef}
        className="rounded-xl border border-slate-200 p-4 min-h-[100px]"
      />

      {error && (
        <p className="text-xs text-rose-500">{error}</p>
      )}

      {!loaded && !error && (
        <p className="text-xs text-slate-400">
          {lang === 'zh' ? '加载支付表单...' : 'Loading payment form...'}
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {t('details.securedBy')}
        </span>
        <span className="flex gap-1.5">
          {['VISA', 'MC', 'AMEX'].map((c) => (
            <span key={c} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
              {c}
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
