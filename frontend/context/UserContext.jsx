import PropTypes from 'prop-types'
import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext(null)

// Returns user object if authenticated, otherwise null
export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3000/authenticateUser', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => setUser(data.user))
      .finally(() => setLoading(false))
  }, [])
  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
