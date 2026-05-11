const { serverStrings } = require('../locales/en/serverLocales')

const requireAuth = (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  next()
}

module.exports = requireAuth
