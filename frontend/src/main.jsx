import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { UserProvider } from '../context/UserContext'
import './index.css'

const script = document.createElement('script')
script.src = `${process.env.VITE_API_BASE_URL}/maps/api/js?libraries=places&callback=__mapsReady`

window.__mapsReady = () => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <UserProvider>
        <App />
      </UserProvider>
    </StrictMode>
  )
}
document.head.appendChild(script)
