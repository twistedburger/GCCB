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
    const response = await fetch('http://localhost:3000/authorize', {
      credentials: 'include',
    })
    if (response.status != 200) {
      return
    }
    const user = await response.json()
    setAuthorization(user.authorization)
  }

  const deauthorizeUser = async () => {
    setAuthorization('')
  }

  const value = { authorization, authorizeUser, deauthorizeUser }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}

export const useAuth = () => {
  return useContext(AuthContext)
}
