import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import BookingHeader from './BookingHeader.jsx'
import BookingFooter from './BookingFooter.jsx'
import Stepper from './Stepper.jsx'
import BookingSummary from './BookingSummary.jsx'
import { stepForPath } from './steps.js'
import { containerCls as inner } from './container.js'
import { useBooking } from '../../context/BookingContext.jsx'

export default function BookingLayout() {
  const { pathname } = useLocation()
  const { maxStep } = useBooking()
  const currentStep = stepForPath(pathname)

  // Each step should open at the top, not at the previous step's scroll position.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  // You can go back to earlier steps, but not skip ahead via the URL — jumping
  // forward sends you back to the start to go through the flow in order.
  if (currentStep > maxStep) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white lg:overflow-x-visible">
      <BookingHeader innerClass={inner} />

      <div className={`${inner} pt-7 sm:pt-9`}>
        <Stepper currentStep={currentStep} />
      </div>

      <div
        className={`${inner} grid flex-1 gap-8 py-8 sm:py-10 lg:grid-cols-[1fr_380px] lg:gap-12`}
      >
        {/* min-w-0 lets long bilingual text wrap/truncate inside the grid
            column instead of forcing the track wider than the viewport.
            keyed so the content re-animates on each step change. */}
        <main className="min-w-0">
          <div key={pathname} className="animate-step">
            <Outlet />
          </div>
        </main>

        {/* Right rail on desktop; stacks below the content on mobile. */}
        <aside className="min-w-0 lg:sticky lg:top-8 lg:h-fit">
          <BookingSummary />
        </aside>
      </div>

      <BookingFooter innerClass={inner} />
    </div>
  )
}
