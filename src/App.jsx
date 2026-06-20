import { Routes, Route, Outlet } from 'react-router-dom'
import BookingLayout from './components/booking/BookingLayout.jsx'
import PartyStep from './pages/PartyStep.jsx'
import ServicesStep from './pages/ServicesStep.jsx'
import TherapistStep from './pages/TherapistStep.jsx'
import DateTimeStep from './pages/DateTimeStep.jsx'
import DetailsStep from './pages/DetailsStep.jsx'
import ConfirmationPage from './pages/ConfirmationPage.jsx'
import NotFound from './pages/NotFound.jsx'
import { AdminAuthProvider, RequireAdmin } from './admin/auth.jsx'
import { AdminDataProvider } from './admin/data.jsx'
import AdminLogin from './admin/AdminLogin.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import AdminOverview from './admin/AdminOverview.jsx'
import AdminCalendar from './admin/AdminCalendar.jsx'
import AdminBookings from './admin/AdminBookings.jsx'
import AdminAvailability from './admin/AdminAvailability.jsx'
import AdminStaff from './admin/AdminStaff.jsx'

// Scopes the admin auth + data providers to /admin routes only, so customer
// pages never load the admin store.
function AdminProviders() {
  return (
    <AdminAuthProvider>
      <AdminDataProvider>
        <Outlet />
      </AdminDataProvider>
    </AdminAuthProvider>
  )
}

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

      {/* Admin dashboard — gated, with its own providers. */}
      <Route element={<AdminProviders />}>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="availability" element={<AdminAvailability />} />
          <Route path="staff" element={<AdminStaff />} />
        </Route>
      </Route>
    </Routes>
  )
}
