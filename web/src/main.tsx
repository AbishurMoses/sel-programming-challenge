import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { apiService } from './services/apiService.ts'
import { applyTheme, getInitialTheme } from './hooks/useTheme.ts'

applyTheme(getInitialTheme())

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') return

  const { worker } = await import('./mocks/browser.ts')
  return worker.start()
}

apiService.onUnauthorized = () => {
  window.location.reload()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})