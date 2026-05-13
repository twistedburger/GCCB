import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { UserProvider } from '../context/UserContext'
import { NotificationProvider } from '../context/NotificationContext'
import './index.css'

const script = document.createElement('script')
const baseURL = import.meta.env.VITE_API_BASE_URL

script.src = `${baseURL}/maps/api/js?libraries=places&callback=__mapsReady`

window.__mapsReady = () => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <UserProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </UserProvider>
    </StrictMode>
  )
}
document.head.appendChild(script)
