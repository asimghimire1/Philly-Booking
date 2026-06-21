import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { BookingProvider } from './context/BookingContext.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <BookingProvider>
          <App />
        </BookingProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
