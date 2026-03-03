require('dotenv').config({ path: __dirname + '/.env' })
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
app.use(express.json())

app.get('/loginRoute', (req, res) => {
  const connection = req.query.connection
  const returnTo = req.query.returnTo || 'http://localhost:5173/'
  res.oidc.login({
    returnTo: returnTo,
    authorizationParams: {
      connection: connection,
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

app.get('/sso_list', async (req, res) => {
  const search = req.query.search ? req.query.search : ''
  try {
    const results = await db.query(
      'SELECT * FROM "sso" WHERE school_name ILIKE $1 OR school_nickname ILIKE $1',
      [`%${search}%`]
    )
    return res.json(results.rows)
  } catch (error) {
    console.log(error)
    return res.status(500).send('Oops, something went wrong placeholder')
  }
})

app.post('/createNewUser', async (req, res) => {
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

app.get('/authorize', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send('Access Denied placeholder')
  }
  let user = null

  try {
    user = await selectUser(req)
  } catch (error) {
    console.log(error)
    return res.status(500).send('Oops, something went wrong placeholder')
  }

  const authorization = user ? user.role : 'user'

  return res.json({ authorization: authorization })
})

/**
 * Insert the current user into the DB. User must be authenticated and not exist in the DB
 * @returns the user fetched from the DB, or null
 */
async function insertUser(req) {
  const results = await db.query(
    'INSERT INTO "user" (email, role, name, nickname, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [
      req.oidc.user.email,
      'user',
      req.oidc.user.name,
      req.oidc.user.nickname,
      req.oidc.user.description,
    ]
  )

  return results.rowCount !== 0 ? results.rows[0] : null
}

app.get('/api/events', (req, res) => {
  db.query(
    `SELECT 
              e.*,
              u.name as creator_name 
            FROM event e
            LEFT JOIN "user" u ON u.id = e.creator_id`,
    (error, results) => {
      if (error) {
        console.error('Error fetching events:', error)
        res.status(500).json({ error: 'Failed to fetch events' })
        return
      }
      console.log('Events fetched:', results.rows)
      res.status(200).json(results.rows)
    }
  )
})

app.get('/api/routes', (req, res) => {
  db.query(
    `SELECT 
      r.*, 
      COUNT(ur.user_id) as people_going 
    FROM route r
    LEFT JOIN user_route ur ON r.id = ur.route_id
    GROUP BY r.id`,
    (error, results) => {
      if (error) {
        console.error('Error fetching routes:', error)
        res.status(500).json({ error: 'Failed to fetch routes' })
        return
      }
      console.log('Routes fetched:', results.rows)
      res.status(200).json(results.rows)
    }
  )
})

if (require.main === module) {
  app.listen(port, () => {
    console.log(`GCCB Backend listening on port ${port}`)
  })
}

module.exports = app
