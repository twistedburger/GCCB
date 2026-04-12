import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, authLevel } from '../hooks/Authorization'
import PropTypes from 'prop-types'

/**
 * Utility to compare current user authorization against a required threshold.
 *
 * @param {string} authorization - The label of the current user's role (e.g., 'user', 'admin').
 * @param {Object} requiredAuthorization - The required authorization object containing a numeric value.
 * @returns {boolean} True if the user's level is equal to or higher than the requirement.
 */

export const CheckAuthorization = (authorization, requiredAuthorization) => {
  let authorizationLevel = 0

  for (const value of Object.values(authLevel)) {
    if (value.label === authorization) {
      authorizationLevel = value.value
    }
  }

  return authorizationLevel >= requiredAuthorization.value
}

/**
 * A wrapper component that gates access to child routes based on authorization levels.
 * Redirects unauthorized users to the homepage while preserving their intended location.
 *
 * @param {Object} props
 * @param {Object} [props.requiredAuthorization=authLevel.USER] - The minimum role required to access the route.
 * @returns {JSX.Element} Either an <Outlet /> for authorized users or a <Navigate /> redirect.
 */

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
