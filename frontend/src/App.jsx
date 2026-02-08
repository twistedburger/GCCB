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

function App() {
  return (
    <Router>
      <div className="app-container">
        <NavigationBar />

        {/* pages */}
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
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
      </div>
    </Router>
  )
}

export default App
