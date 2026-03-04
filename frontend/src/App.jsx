import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'
import NavigationBar from './components/NavigationBar'
import Home from './pages/Home'
import Filter from './pages/home/Filter'
import Report from './pages/home/Report'
import EventDetail from './pages/home/EventDetail'
import MyTrip from './pages/MyTrips'
import Dashboard from './pages/dashboard/Dashboard'
import Analytics from './pages/dashboard/Analytics'
import Profile from './pages/dashboard/Profile'
import Settings from './pages/dashboard/Settings'
import Co2Savings from './pages/dashboard/analytics/Co2Savings'
import Commutes from './pages/dashboard/analytics/Commutes'
import TripFrequency from './pages/dashboard/analytics/TripFrequency'
import Activity from './pages/dashboard/analytics/Activity'
import Login from './pages/Login'
import CreateUser from './pages/CreateUser'
import { useState, useEffect } from 'react'

// To be used later

// const authLevel = {
//   USER: "user",
//   MODERATOR: "moderator",
//   ADMIN: "admin",
//   SUPERADMIN: "superadmin"
// }

function App() {
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    authenticateUser()
  }, [])

  async function authenticateUser() {
    const response = await fetch('http://localhost:3000/authenticateUser', {
      credentials: 'include',
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.log(response.status + ' ' + errorText)
      return
    }
    const responseJSON = await response.json()
    if (responseJSON) {
      setUserAuthenticated(responseJSON.isAuthenticated)
      setCurrentUser(responseJSON.user)
    }
  }

  return (
    <Router>
      <div className="app-container h-screen">
        {/* pages */}
        <main className="content bg-background-off-white">
          <Routes>
            <Route
              path="/*"
              element={HomePage(userAuthenticated, currentUser)}
            />
            <Route path="/mytrip" element={<MyTrip />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route
              path="/dashboard/analytics/co2-savings"
              element={<Co2Savings />}
            />
            <Route
              path="/dashboard/analytics/commutes"
              element={<Commutes />}
            />
            <Route
              path="/dashboard/analytics/trip-frequency"
              element={<TripFrequency />}
            />
            <Route
              path="/dashboard/analytics/activity"
              element={<Activity />}
            />

            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/settings" element={<Settings />} />
          </Routes>
          <FilterPage />
          <EventDetailPage />
          <ReportPage />
        </main>
        {userAuthenticated && <NavigationBar />}
      </div>
    </Router>
  )
}

function HomePage(userAuthenticated, currentUser) {
  if (!userAuthenticated) {
    return <Login />
  }
  if (!currentUser) {
    return <CreateUser />
  }

  return <Home />
}

function FilterPage() {
  const location = useLocation()
  if (location.pathname !== '/filter') return null
  return <Filter />
}

function EventDetailPage() {
  const location = useLocation()
  if (!location.pathname.startsWith('/event/')) return null
  return <EventDetail />
}

function ReportPage() {
  const location = useLocation()
  if (!location.pathname.startsWith('/report/')) return null
  return <Report />
}

export default App
