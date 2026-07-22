import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { injectSpeedInsights } from '@vercel/speed-insights'
import './index.css'
import App from './App.tsx'

const isVercel = import.meta.env.VITE_VERCEL === 'true'

if (isVercel) {
  injectSpeedInsights()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {isVercel && <Analytics />}
  </StrictMode>
)
