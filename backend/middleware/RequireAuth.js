const { serverStrings } = require('../locales/en/serverLocales')

/**
 * Middleware to require authentication for a route
 *
 * @param {req} req - Express request object, expected to have OIDC authentication info
 * @param {res} res - Express response object, used to send 403 if not authenticated
 * @param {next} next - Express next function to pass control to the next middleware if authenticated
 * @returns
 */
const requireAuth = (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  next()
}

module.exports = requireAuth
