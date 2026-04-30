import PropTypes from 'prop-types'
import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const UserContext = createContext(null)

/**
 * Context provider that manages the global user state and authentication status.
 * It handles the initial session check with the backend upon mounting.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components that will have access to the user context.
 * @returns {JSX.Element}
 */

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [userError, setUserError] = useState('')

  useEffect(() => {
    setLoadingUser(true)

    fetch(`${process.env.VITE_API_BASE_URL}/authenticateUser`, {
      credentials: 'include',
    })
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

/**
 * Custom hook to access the current user context.
 * Provides the user object, loading status, and error state.
 *
 * @throws {Error} If used outside of a UserProvider.
 * @returns {Object} The user context value: { user, setUser, loadingUser, userError, setUserError }.
 */

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
