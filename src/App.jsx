import { Routes, Route } from 'react-router-dom'
import BookingLayout from './components/booking/BookingLayout.jsx'
import PartyStep from './pages/PartyStep.jsx'
import ServicesStep from './pages/ServicesStep.jsx'
import TherapistStep from './pages/TherapistStep.jsx'
import DateTimeStep from './pages/DateTimeStep.jsx'
import DetailsStep from './pages/DetailsStep.jsx'
import ConfirmationPage from './pages/ConfirmationPage.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BookingLayout />}>
        <Route index element={<PartyStep />} />
        <Route path="services" element={<ServicesStep />} />
        <Route path="therapist" element={<TherapistStep />} />
        <Route path="date-time" element={<DateTimeStep />} />
        <Route path="details" element={<DetailsStep />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* Post-booking confirmation — outside the stepper layout. */}
      <Route path="/confirmation" element={<ConfirmationPage />} />
    </Routes>
  )
}
