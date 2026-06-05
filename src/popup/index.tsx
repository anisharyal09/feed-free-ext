import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PopupApp from './PopupApp'
import './popup.css'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <PopupApp />
    </StrictMode>,
  )
}
