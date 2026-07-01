import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/fraunces'
import '@fontsource-variable/hanken-grotesk'

import { App } from './App'
import './index.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Kunde inte hitta rot-elementet för popup-fönstret.')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
)
