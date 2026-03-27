import PropTypes from 'prop-types'
import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [userError, setUserError] = useState('')

  useEffect(() => {
    setLoadingUser(true)

    fetch('http://localhost:3000/authenticateUser', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to authenticate session')
        return res.json()
      })
      .then(data => {
        setUser(data.user)
        setUserError('')
      })
      .catch(err => {
        setUserError(err.message || 'An unexpected error occurred')
        setUser(null)
      })
      .finally(() => {
        setLoadingUser(false)
      })
  }, [])

  const value = useMemo(
    () => ({
      user,
      setUser,
      loadingUser,
      userError,
      setUserError,
    }),
    [user, loadingUser, userError]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
