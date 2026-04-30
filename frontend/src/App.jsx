import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import MyTrip from './pages/MyTrips'
import Dashboard from './pages/Dashboard'
import Co2Savings from './pages/dashboard/Co2Savings'
import Commutes from './pages/dashboard/Commutes'
import TripFrequency from './pages/dashboard/TripFrequency'
import Activity from './pages/dashboard/Activity'
import Login from './pages/Login'
import CreateUser from './pages/CreateUser'
import UserGuide from './pages/UserGuide'
import { useState, useEffect } from 'react'
import { authLevel, AuthProvider } from './hooks/Authorization'
import ProtectedRoute from './components/ProtectedRoute'
import Filter from './pages/home/Filter'
import EventDetail from './pages/home/EventDetail'
import Moderate from './pages/moderate/Moderate'

function App() {
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [ssoProfile, setSsoProfile] = useState(null)
  useEffect(() => {
    authenticateUser()
  }, [])

  async function authenticateUser() {
    const response = await fetch(
      `${process.env.VITE_API_BASE_URL}/authenticateUser`,
      {
        credentials: 'include',
      }
    )
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
            {userAuthenticated && currentUser && (
              <Sidebar userRole={currentUser.role} />
            )}{' '}
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
                >
                  <Route path="filter" element={<Filter />} />
                  <Route path="event/:id" element={<EventDetail />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute requiredAuthorization={authLevel.USER} />
                  }
                >
                  <Route path="/mytrip" element={<MyTrip />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route
                    path="/dashboard/co2-savings"
                    element={<Co2Savings />}
                  />
                  <Route path="/dashboard/commutes" element={<Commutes />} />
                  <Route
                    path="/dashboard/trip-frequency"
                    element={<TripFrequency />}
                  />
                  <Route path="/user-guide" element={<UserGuide />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute requiredAuthorization={authLevel.ADMIN} />
                  }
                >
                  <Route path="/dashboard/activity" element={<Activity />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute
                      requiredAuthorization={authLevel.MODERATOR}
                    />
                  }
                >
                  <Route path="/moderate" element={<Moderate />} />
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
