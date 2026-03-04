import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const script = document.createElement('script')
script.src =
  'http://localhost:3000/maps/api/js?libraries=places&callback=__mapsReady'

window.__mapsReady = () => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

document.head.appendChild(script)
