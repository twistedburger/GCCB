const express = require('express')
const { auth } = require('express-openid-connect')
const cors = require('cors')

const app = express()
const db = require('./db')
const port = 3000

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: 'http://localhost:3000',
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  // authorizationParams: {
  //     connection: 'google-oauth2',
  //   },
}

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
app.use(auth(config))

app.get('/loginRoute', (req, res) => {
  // const connection = req.query.connection // This would allow us to connect to a specific SSO provider
  const returnTo = req.query.returnTo || 'http://localhost:5173/'
  res.oidc.login({
    returnTo: returnTo,
    authorizationParams: {
      connection: 'Username-Password-Authentication',
    },
  })
})

app.get('/logoutRoute', (req, res) => {
  const returnTo = req.query.returnTo || 'http://localhost:5173/'
  res.oidc.logout({
    returnTo: returnTo,
  })
})

app.get('/authenticateUser', async (req, res) => {
  let isAuthenticated = req.oidc.isAuthenticated()
  let user = null
  if (!isAuthenticated) {
    return res.json({ isAuthenticated: isAuthenticated, user: user })
  }
  try {
    user = await selectUser(req)
  } catch (error) {
    console.log(error)
    return res.status(500).send('Oops, something went wrong placeholder')
  }

  res.json({ isAuthenticated: isAuthenticated, user: user })
})

/**
 * Select the current user from the DB. user must be authenticated
 * @returns the user fetched from the DB, or null
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

app.get('/createNewUser', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send('Access Denied placeholder')
  }

  let user = null

  try {
    user = await selectUser(req)
    if (!user) {
      user = await insertUser(req)
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send('Oops, something went wrong placeholder')
  }

  res.json({ user: user })
})

/**
 * Insert the current user into the DB. User must be authenticated and not exist in the DB
 * @returns the user fetched from the DB, or null
 */
async function insertUser(req) {
  const results = await db.query(
    'INSERT INTO "user" (email, role, name, nickname) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.oidc.user.email, 'user', req.oidc.user.name, req.oidc.user.nickname]
  )

  return results.rowCount !== 0 ? results.rows[0] : null
}

/**
 * Handles GET request to fetch trip counts by transportation mode within a specified
 * number of days; default to 30 days, 0 means all time. Requires admin role to access.
 *
 * @return JSON response with the number of days and trip counts per mode.
 */
app.get('/api/admin/analytics/trips-by-mode', async (req, res) => {
  try {
    if (!req.oidc.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    const currentUser = await selectUser(req)
    if (!currentUser) {
      return res.status(403).json({ error: 'User not found in DB' })
    }

    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied!' })
    }
    const daysQuery = req.query.days ?? '30'
    const days = parseInt(daysQuery, 10)
    // arbitrary 10 year span to handle dummy data in db
    if (Number.isNaN(days) || days < 0 || days > 3650) {
      return res.status(400).json({
        error: 'Invalid days parameter. Use an integer between 0 and 3650.',
      })
    }

    let queryText = `
      SELECT
        transportation_mode AS mode,
        COUNT(*)::int AS trips
      FROM route
      WHERE transportation_mode IS NOT NULL
    `
    const params = []

    if (days !== 0) {
      queryText += `
        AND depart_time >= NOW() - ($1 * INTERVAL '1 day')
      `
      params.push(days)
    }

    queryText += `
      GROUP BY transportation_mode
      ORDER BY trips DESC, mode ASC;
    `

    const results = await db.query(queryText, params)

    return res.status(200).json({
      days,
      items: results.rows,
    })
  } catch (err) {
    console.error('Trips-by-mode error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.get('/sample_query', (req, res) => {
  db.query('SELECT *', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
})

app.listen(port, () => {
  console.log(`GCCB Backend listening on port ${port}`)
})
