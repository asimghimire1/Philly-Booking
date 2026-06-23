import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { BookingProvider } from './context/BookingContext.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { TherapistProvider } from './data/therapists.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <TherapistProvider>
          <BookingProvider>
            <App />
          </BookingProvider>
        </TherapistProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
