import PropTypes from 'prop-types'
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Returns user object if authenticated, otherwise null
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3000/authenticateUser', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => setUser(data.user))
      .finally(() => setLoading(false))
  }, [])
  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
