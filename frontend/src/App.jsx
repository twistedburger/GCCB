import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NavigationBar from './components/NavigationBar'
import Home from './pages/Home'
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
import { useState, useEffect } from 'react'

function App() {
  const [userAuthenticated, setUserAuthenticated] = useState(false)

  useEffect(() => {
    authenticateUser()
  })

  const authenticateUser = async () => {
    const response = await fetch('http://localhost:3000/authenticateUser', {
      credentials: 'include',
    })
    const responseJSON = await response.json()
    if (responseJSON) {
      setUserAuthenticated(responseJSON.isAuthenticated)
    }
  }

  return (
    <Router>
      <div className="app-container h-screen">
        {/* pages */}
        <main className="content bg-background-off-white">
          <Routes>
            <Route path="/" element={HomePage(userAuthenticated)} />
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
        </main>
        <NavigationBar />
      </div>
    </Router>
  )
}

function HomePage(userAuthenticated) {
  if (userAuthenticated) {
    return <Home />
  }
  return <Login />
}

export default App
