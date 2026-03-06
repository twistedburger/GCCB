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
import { authLevel, AuthProvider } from './utils/Authorization'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [ssoProfile, setSsoProfile] = useState(null)
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
      setSsoProfile(responseJSON.ssoProfile)
    }
  }

  return (
    <Router>
      <AuthProvider>
        <div className="app-container h-screen">
          {/* pages */}
          <main className="content bg-background-off-white">
            <Routes>
              <Route
                path="/*"
                element={
                  !userAuthenticated ? (
                    <Login />
                  ) : !currentUser ? (
                    <CreateUser
                      ssoUser={ssoProfile}
                      onUserCreated={setCurrentUser}
                    />
                  ) : (
                    <Home />
                  )
                }
              />
              <Route
                element={
                  <ProtectedRoute requiredAuthorization={authLevel.USER} />
                }
              >
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
              </Route>
            </Routes>
            <FilterPage />
            <EventDetailPage />
            <ReportPage />
          </main>
          {userAuthenticated && <NavigationBar />}
        </div>
      </AuthProvider>
    </Router>
  )
}

function FilterPage() {
  const location = useLocation()
  if (location.pathname !== '/filter') return null
  return <Filter />
}

function EventDetailPage() {
  const location = useLocation()
  if (
    !location.pathname.startsWith('/event/') &&
    !location.pathname.startsWith('/report/')
  )
    return null
  return <EventDetail />
}

function ReportPage() {
  const location = useLocation()
  if (!location.pathname.startsWith('/report')) return null
  return <Report />
}

export default App
