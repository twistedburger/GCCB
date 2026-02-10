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
  let reason = ''
  let user = null
  if (!isAuthenticated) {
    reason = 'invalid login placeholder'
    res.json({ isAuthenticated: isAuthenticated, user: user, reason: reason })
    return
  }
  db.query(
    'SELECT * FROM "user" WHERE email = $1',
    [req.oidc.user.email],
    (error, results) => {
      if (error) {
        console.log(error)
        reason = 'Query error placeholder'
        isAuthenticated = false
      } else if (results.rowCount === 0) {
        db.query(
          'INSERT INTO "user" (email, role, name, nickname) VALUES ($1, $2, $3, $4) RETURNING *',
          [
            req.oidc.user.email,
            'user',
            req.oidc.user.name,
            req.oidc.user.nickname,
          ],
          (error, results) => {
            if (error) {
              console.log(error)
              reason = 'Query error placeholder'
              isAuthenticated = false
              return
            }
            user = results.rows[0]
          }
        )
      } else {
        user = results.rows[0]
      }
      res.json({ isAuthenticated: isAuthenticated, user: user, reason: reason })
    }
  )
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
