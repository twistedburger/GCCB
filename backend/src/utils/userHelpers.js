const pool = require('../../db').pool

/**
 * Select the current user from the DB. User must be authenticated via Auth0.
 *
 * @param {Object} req - The Express request object containing req.oidc.user
 * @returns {Object|null} the user fetched from the DB, or null
 */
async function selectUser(req) {
  if (!req.oidc || !req.oidc.user) {
    return null
  }

  try {
    const results = await pool.query('SELECT * FROM "user" WHERE email = $1', [
      req.oidc.user.email,
    ])

    if (results.rowCount !== 0) {
      return results.rows[0]
    }

    return null
  } catch (err) {
    console.error('Error in selectUser helper:', err)
    throw err // Let the controller handle the 500 error
  }
}

module.exports = {
  selectUser,
}
