const db = require('../../db')

/**
 * Select the current user from the DB. user must be authenticated
 *
 * @returns {Object} the user fetched from the DB, or null
 */
async function selectUser(req) {
  const results = await db.query('SELECT * FROM "user" WHERE email = $1', [
    req.oidc.user.email,
  ])

  if (results.rowCount !== 0) {
    return results.rows[0]
  }
  return null
}

/**
 * Select a user by their ID
 *
 * @param {number} id - the ID of the user to select
 * @returns {Object} the user fetched from the DB, or null
 */
async function selectUserById(id) {
  const results = await db.query('SELECT * FROM "user" WHERE id = $1', [id])
  if (results.rowCount !== 0) {
    return results.rows[0]
  }
  return null
}

module.exports = { selectUser, selectUserById }
