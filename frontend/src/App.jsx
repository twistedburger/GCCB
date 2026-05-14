import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import MyTrip from './pages/MyTrips'
import Dashboard from './pages/Dashboard'
import Co2Savings from './pages/dashboard/Co2Savings'
import Commutes from './pages/dashboard/Commutes'
import TripFrequency from './pages/dashboard/TripFrequency'
import Activity from './pages/dashboard/Activity'
import Badges from './pages/dashboard/Badges'
import Login from './pages/Login'
import CreateUser from './pages/CreateUser'
import UserGuide from './pages/UserGuide'
import { useState, useEffect, useCallback } from 'react'
import { authLevel, AuthProvider } from './hooks/Authorization'
import ProtectedRoute from './components/ProtectedRoute'
import Filter from './pages/home/Filter'
import EventDetail from './pages/home/EventDetail'
import Moderate from './pages/moderate/Moderate'
import BannedUsers from './pages/BannedUsers'
import Chats from './pages/Chats'
import Notifications from './pages/Notifications'
import { useUser } from '../context/UserContext'
import { UnreadMessagesProvider } from '../context/UnreadMessagesContext'

function App() {
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [ssoProfile, setSsoProfile] = useState(null)

  const baseURL = import.meta.env.VITE_API_BASE_URL
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL

  const [bannedError] = useState(
    new URLSearchParams(window.location.search).get('error') === 'banned'
  )
  const { user, setUser } = useUser()

  const authenticateUser = useCallback(async () => {
    try {
      const response = await fetch(`${baseURL}/authenticateUser`, {
        credentials: 'include',
      })

      if (!response.ok) {
        console.log(response.status, await response.json())
        return
      }

      const data = await response.json()
      if (data.banned) {
        window.location.href = `${baseURL}/logoutRoute?returnTo=${encodeURIComponent(`${frontendUrl}/?error=banned`)}`
        return
      }
      if (data) {
        setUserAuthenticated(data.isAuthenticated)
        setUser(data.user)
        setSsoProfile(data.ssoProfile)
      }
    } catch (err) {
      console.error(err.message)
    }
  }, [setUser]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    authenticateUser()
  }, [authenticateUser])

  return (
    <Router>
      <AuthProvider>
        <div className="app-container min-h-screen">
          {/* pages */}
          <div className="relative w-full min-h-screen flex bg-background-off-white">
            {userAuthenticated && user && (
              <UnreadMessagesProvider>
                <Sidebar userData={user} />

                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        !userAuthenticated ? (
                          <Login error={bannedError} />
                        ) : !user ? (
                          <CreateUser
                            ssoUser={ssoProfile}
                            onUserCreated={newUser => {
                              setUser(newUser)
                              setUserAuthenticated(true)
                            }}
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
                        <ProtectedRoute
                          requiredAuthorization={authLevel.USER}
                        />
                      }
                    >
                      <Route path="/mytrip" element={<MyTrip />} />
                      <Route path="/mytrip/:id" element={<MyTrip />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route
                        path="/dashboard/co2-savings"
                        element={<Co2Savings />}
                      />
                      <Route
                        path="/dashboard/commutes"
                        element={<Commutes />}
                      />
                      <Route
                        path="/dashboard/trip-frequency"
                        element={<TripFrequency />}
                      />
                      <Route path="/dashboard/badges" element={<Badges />} />
                      <Route
                        path="/dashboard/badges/:id"
                        element={<Badges />}
                      />
                      <Route path="/user-guide" element={<UserGuide />} />
                      <Route path="/bannedusers" element={<BannedUsers />} />
                      <Route path="/chats/*" element={<Chats />} />
                      <Route
                        path="/notifications"
                        element={<Notifications />}
                      />
                    </Route>
                    <Route
                      element={
                        <ProtectedRoute
                          requiredAuthorization={authLevel.ADMIN}
                        />
                      }
                    >
                      <Route
                        path="/dashboard/activity"
                        element={<Activity />}
                      />
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
              </UnreadMessagesProvider>
            )}
          </div>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
