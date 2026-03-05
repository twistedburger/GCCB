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

app.get('/maps/api/js', async (req, res) => {
  const params = new URLSearchParams(req.query)
  params.set('key', process.env.GOOGLE_MAPS_API_KEY)

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/js?${params.toString()}`
  )
  const script = await response.text()
  res.setHeader('Content-Type', 'application/javascript')
  res.send(script)
})

app.get('/maps/geocode', async (req, res) => {
  const params = new URLSearchParams({
    address: req.query.address,
    key: process.env.GOOGLE_MAPS_API_KEY,
  })
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params}`
  )
  const data = await response.json()
  res.json(data)
})

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
    'INSERT INTO "user" (email, role, name, nickname) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.oidc.user.email, 'user', req.oidc.user.name, req.oidc.user.nickname]
  )

  return results.rowCount !== 0 ? results.rows[0] : null
}

/**
 * Returns the events for the landing page with applied filters if given.
 * @returns events fetched from the db, or an empty array
 */
app.get('/api/events', (req, res) => {
  const { time, verified, transportation_modes } = req.query

  const conditions = []
  const values = []

  if (time) {
    values.push(time)
    conditions.push(
      `e.event_time BETWEEN ($${values.length}::timestamp - interval '2 hours') AND ($${values.length}::timestamp + interval '2 hours')`
    )
  }
  if (verified === 'true') {
    conditions.push(`e.verified = true`)
  }
  if (transportation_modes) {
    const modes = transportation_modes.split(',')
    values.push(modes)
    conditions.push(`r.transportation_mode = ANY($${values.length})`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  db.query(
    `SELECT DISTINCT e.*, u.name as creator_name 
     FROM event e
     LEFT JOIN "user" u ON u.id = e.creator_id
     LEFT JOIN event_route er ON er.event_id = e.id
     LEFT JOIN route r ON r.id = er.route_id
     ${where}`,
    values,
    (error, results) => {
      if (error) {
        console.error('Error fetching events:', error)
        res.status(500).json({ error: 'Failed to fetch events' })
        return
      }
      res.status(200).json(results.rows)
    }
  )
})

/**
 * Returns the routes for the landing page with applied filters if given.
 * @returns routes fetched from the db, or an empty array
 */
app.get('/api/routes', (req, res) => {
  const { time, transportation_modes, verified } = req.query

  const conditions = []
  const values = []

  if (time) {
    values.push(time)
    conditions.push(
      `r.depart_time BETWEEN ($${values.length}::timestamp - interval '2 hours') AND ($${values.length}::timestamp + interval '2 hours')`
    )
  }
  if (transportation_modes) {
    const modes = transportation_modes.split(',')
    values.push(modes)
    conditions.push(`r.transportation_mode = ANY($${values.length})`)
  }
  if (verified === 'true') {
    conditions.push(`e.verified = true`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  db.query(
    `SELECT DISTINCT r.*,
      (SELECT COUNT(*) FROM user_route ur WHERE ur.route_id = r.id) as people_going
     FROM route r
     LEFT JOIN event_route er ON er.route_id = r.id
     LEFT JOIN event e ON e.id = er.event_id
     ${where}`,
    values,
    (error, results) => {
      if (error) {
        console.error('Error fetching routes:', error)
        res.status(500).json({ error: 'Failed to fetch routes' })
        return
      }
      res.status(200).json(results.rows)
    }
  )
})

/**
 * Returns event details given a specific event id.
 * @returns an event
 */
app.get('/api/eventdetail/:id', async (req, res) => {
  const { id } = req.params
  try {
    const eventResult = await db.query(
      `SELECT e.*, 
        u.id as creator_id,
        u.name as creator_name, 
        u.nickname, 
        u.profile_pic
       FROM event e
       LEFT JOIN "user" u ON u.id = e.creator_id
       WHERE e.id = $1`,
      [id]
    )

    const routesResult = await db.query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM user_route ur WHERE ur.route_id = r.id) as people_going
       FROM route r
       LEFT JOIN event_route er ON er.route_id = r.id
       WHERE er.event_id = $1`,
      [id]
    )

    const event = eventResult.rows[0]
    event.routes = routesResult.rows

    res.status(200).json(event)
    console.log(event)
  } catch (error) {
    console.error('Error fetching event detail:', error)
    res.status(500).json({ error: 'Failed to fetch event detail' })
  }
})

/**
 * Checks if the currently authenticated user has joined a specific route.
 * @returns a boolean
 */
app.get('/api/routes/:id/isJoined', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.json({ isJoined: false })
  }
  try {
    const user = await selectUser(req)
    const result = await db.query(
      'SELECT * FROM user_route WHERE route_id = $1 AND user_id = $2',
      [req.params.id, user.id]
    )
    res.json({ isJoined: result.rowCount > 0 })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to check join status' })
  }
})

/**
 * Adds a user to a route by adding a record to the user_route table.
 */
app.post('/api/routes/:id/join', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).json({ error: 'Not authenticated' })
  }
  try {
    const user = await selectUser(req)
    await db.query(
      'INSERT INTO user_route (user_id, route_id) VALUES ($1, $2)',
      [user.id, req.params.id]
    )
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to join route' })
  }
})

/**
 * Removes a user to a route by removing a record to the user_route table. --> is this okay, or should we have a deleted column?
 */
app.delete('/api/routes/:id/leave', async (req, res) => {
  if (!req.oidc.isAuthenticated())
    return res.status(403).json({ error: 'Not authenticated' })
  try {
    const user = await selectUser(req)
    await db.query(
      'DELETE FROM user_route WHERE user_id = $1 AND route_id = $2',
      [user.id, req.params.id]
    )
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to leave route' })
  }
})

/**
 * Adds a report and corresponding resport junction to report_user, report_event, or report_route.
 */
app.post('/api/report', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).json({ error: 'Not authenticated' })
  }
  try {
    const user = await selectUser(req)
    const { type, targetId, reason, explanation } = req.body
    const result = await db.query(
      'INSERT INTO report (reporter_id, reason, explanation) VALUES ($1, $2, $3) RETURNING id',
      [user.id, reason, explanation]
    )
    const reportId = result.rows[0].id
    if (type == 'user') {
      await db.query(
        'INSERT INTO report_user (report_id, user_id) VALUES ($1, $2)',
        [reportId, targetId]
      )
    } else if (type == 'event') {
      await db.query(
        'INSERT INTO report_event (report_id, event_id) VALUES ($1, $2)',
        [reportId, targetId]
      )
    } else if (type == 'route') {
      await db.query(
        'INSERT INTO report_route (report_id, route_id) VALUES ($1, $2)',
        [reportId, targetId]
      )
    }
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to join route' })
  }
})

if (require.main === module) {
  app.listen(port, () => {
    console.log(`GCCB Backend listening on port ${port}`)
  })
}

module.exports = app
