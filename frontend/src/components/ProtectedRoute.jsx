import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../utils/Authorization'
import PropTypes from 'prop-types'
import { authLevel } from '../utils/Authorization'

const CheckAuthorization = (authorization, requiredAuthorization) => {
  let authorizationLevel = 0

  for (const value of Object.values(authLevel)) {
    if (value.label === authorization) {
      authorizationLevel = value.value
    }
  }

  return authorizationLevel >= requiredAuthorization.value
}

const ProtectedRoute = ({ requiredAuthorization }) => {
  const { authorization } = useAuth()
  const location = useLocation()

  if (!CheckAuthorization(authorization, requiredAuthorization)) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

ProtectedRoute.propTypes = {
  requiredAuthorization: PropTypes.shape({
    value: PropTypes.number,
    label: PropTypes.string,
  }),
}

ProtectedRoute.defaultProps = {
  requiredAuthorization: authLevel.USER,
}

export default ProtectedRoute
