import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import MyTrip from './pages/MyTrips'
import Dashboard from './pages/Dashboard'
import Co2Savings from './pages/analytics/Co2Savings'
import Commutes from './pages/analytics/Commutes'
import TripFrequency from './pages/analytics/TripFrequency'
import Activity from './pages/analytics/Activity'
import Login from './pages/Login'
import CreateUser from './pages/CreateUser'
import UserGuide from './pages/UserGuide'
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
        <div className="app-container min-h-screen">
          {/* pages */}
          <div className="relative w-full min-h-screen flex bg-background-off-white">
            {userAuthenticated && currentUser && <Sidebar />}{' '}
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route
                  path="/"
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
                  <Route
                    path="/analytics/co2-savings"
                    element={<Co2Savings />}
                  />
                  <Route path="/analytics/commutes" element={<Commutes />} />
                  <Route
                    path="/analytics/trip-frequency"
                    element={<TripFrequency />}
                  />
                  <Route path="/analytics/activity" element={<Activity />} />
                  <Route path="/user-guide" element={<UserGuide />} />
                </Route>
              </Routes>
            </main>
          </div>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
