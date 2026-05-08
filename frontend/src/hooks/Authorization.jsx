import PropTypes from 'prop-types'
import { useState, useContext, createContext } from 'react'

const AuthContext = createContext(null)

export const authLevel = {
  USER: { value: 1, label: 'user' },
  MODERATOR: { value: 2, label: 'moderator' },
  ADMIN: { value: 3, label: 'admin' },
  SUPERADMIN: { value: 4, label: 'superadmin' },
}

export const AuthProvider = ({ children }) => {
  const [authorization, setAuthorization] = useState('')

  const authorizeUser = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/authorize`,
      {
        credentials: 'include',
      }
    )
    if (response.status != 200) {
      setAuthorization('')
      return
    }
    const user = await response.json()
    setAuthorization(user.authorization)
  }

  const value = { authorization, authorizeUser }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}

export const useAuth = () => {
  return useContext(AuthContext)
}
