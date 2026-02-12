const express = require('express')
const { auth } = require('express-openid-connect')
const cors = require('cors')
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

app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
})

app.get('/authenticateUser', (req, res) => {
  let isAuthenticated = req.oidc.isAuthenticated()
  let user = null
  if (!isAuthenticated) {
    return res.json({ isAuthenticated: isAuthenticated, user: user })
  }
  try {
    user = selectUser(req)
  } catch {
    return res.status(500).send('Oops, something went wrong placeholder')
  }

  res.json({ isAuthenticated: isAuthenticated, user: user })
})

/**
 * Select the current user from the DB. user must be authenticated
 * @returns the user fetched from the DB, or null
 */
function selectUser(req) {
  let user = null
  db.query(
    'SELECT * FROM "user" WHERE email = $1',
    [req.oidc.user.email],
    (error, results) => {
      if (error) {
        throw error
      }
      if (results.rowCount !== 0) {
        user = results.rows[0]
      }
    }
  )
  return user
}

;(app.get('/createNewUser'),
  (req, res) => {
    if (!req.oidc.isAuthenticated()) {
      return res.status(403).send('Access Denied placeholder')
    }

    let user = null

    try {
      user = selectUser(req)
      if (!user) {
        insertUser(req)
      }
    } catch {
      return res.status(500).send('Oops, something went wrong placeholder')
    }

    res.json({ user: user })
  })

/**
 * Insert the current user into the DB. User must be authenticated and not exist in the DB
 * @returns the user fetched from the DB, or null
 */
function insertUser(req) {
  let user = null
  db.query(
    'INSERT INTO "user" (email, role, name, nickname) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.oidc.user.email, 'user', req.oidc.user.name, req.oidc.user.nickname],
    (error, results) => {
      if (error) {
        throw error
      } else {
        user = results.rows[0]
      }
    }
  )
  return user
}

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
