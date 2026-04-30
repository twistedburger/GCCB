require('dotenv').config({ path: __dirname + '/.env' })
const express = require('express')
const { auth } = require('express-openid-connect')
const cors = require('cors')
const axios = require('axios')
const { serverStrings } = require('./locales/en/serverLocales')

const app = express()
const db = require('./db')
const pool = db.pool
const port = 3000

const { defaultCo2Calculator } = require('./src/utils/co2_calculator')
const { EMISSIONS_G_PER_KM } = require('./src/constants/emissions')
const { createAnalyticsHelpers } = require('./src/utils/analytics_helpers')

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: 'http://localhost:3000',
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
}

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
app.use(auth(config))
app.use(express.json())

const analytics = createAnalyticsHelpers({
  db,
  co2Calculator: defaultCo2Calculator,
  emissions: { EMISSIONS_G_PER_KM },
})

/**
 * Proxy server route to fetch map from google maps api
 *
 * If response is not ok, sends error json {error: error message}
 * if error is thrown by api call, caught error is sent in same format.
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 *
 * @returns {string} text response from google api
 */
app.get('/maps/api/js', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query)
    params.set('key', process.env.GOOGLE_MAPS_API_KEY)

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/js?${params.toString()}`
    )

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: serverStrings.errors.google })
    }

    const script = await response.text()
    res.setHeader('Content-Type', 'application/javascript')
    res.send(script)
  } catch (err) {
    const status = err.response?.status ?? 500
    const message = err.response?.data?.error?.message ?? err.message
    res.status(status).json({ error: message })
  }
})

/**
 * Login route routes to Auth0 authentication. Returns to homepage once login completed
 */
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

/**
 * Logout route routes to Auth0 deauthentication. Returns to homepage once logout completed
 */
app.get('/logoutRoute', (req, res) => {
  const returnTo = req.query.returnTo || 'http://localhost:5173/'
  res.oidc.logout({
    returnTo: returnTo,
  })
})

/**
 * Middleware to prevent users with more than 3 reports from accessing the app by automatically logging them out.
 *
 * If the database has an error, a 500 status code is sent with an error message.
 */
const checkBannedStatus = async (req, res, next) => {
  if (req.oidc.isAuthenticated()) {
    try {
      const userEmail = req.oidc.user.email
      const result = await db.query(
        'SELECT reported FROM "user" WHERE email = $1',
        [userEmail]
      )
      const user = result.rows[0]

      if (user && user.reported > 3) {
        res.clearCookie('appSession')
        return res.status(200).json({
          isAuthenticated: false,
          banned: true,
        })
      }
    } catch (error) {
      console.error(error)
      return res.status(500).send(serverStrings.errors.generic)
    }
  }
  next()
}

app.use(checkBannedStatus)

/**
 * Authenticate user route checks if the authentication is valid and fetches the current user from the database
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error message.
 *
 * @returns {Object} an authenticated user object:
 * {
 *    isAuthenticated: bool
 *    user: object, user from DB
 *    ssoProfile: object, set from auth0 if user was not in database
 * }
 */
app.get('/authenticateUser', async (req, res) => {
  const isAuthenticated = req.oidc.isAuthenticated()
  const ssoProfile = req.oidc.user || null

  if (!isAuthenticated) {
    return res.json({ isAuthenticated: false, user: null })
  }

  try {
    const dbUser = await selectUser(req)

    if (dbUser) {
      const isActive = await checkAndUpdateActiveStatus(dbUser)

      if (!isActive) {
        return res.status(403).send(serverStrings.errors.inactiveUser)
      }

      await db.query('UPDATE "user" SET last_login = NOW() WHERE id = $1', [
        dbUser.id,
      ])
    }

    res.json({
      isAuthenticated: true,
      user: dbUser,
      ssoProfile: dbUser ? null : ssoProfile,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Checks if the authenticated user is active based on their last login time.
 * User is inactive if they haven't logged in for more than 60 days.
 * @returns {boolean} user's active status
 */
async function checkAndUpdateActiveStatus(user) {
  if (!user.last_login) return true

  const now = new Date()
  const lastLogin = new Date(user.last_login)
  const daysSinceLogin = (now - lastLogin) / (1000 * 60 * 60 * 24)
  const isStillActive = daysSinceLogin <= 60

  if (!isStillActive) {
    await db.query('UPDATE "user" SET active = false WHERE id = $1', [user.id])
  }

  return isStillActive
}

/**
 * Select the current user from the DB. user must be authenticated
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
 * Get the current list of SSO partnered schools, and SSO connection strings.
 *
 * If the database has an error, a 500 status code is sent with an error message.
 *
 * @returns {[Object]} the list of SSO partners
 */
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
    return res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Adds a new user to the database.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error message.
 * If the user is already in the database, a 400 status code is sent with an error message.
 *
 * @returns {Object} a json user objet
 */
app.post('/createNewUser', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const existingUser = await selectUser(req)
    if (existingUser) {
      return res.status(400).send(serverStrings.errors.userExists)
    }
    const newUser = await insertUserFromForm(
      req.oidc.user.name,
      req.oidc.user.email,
      req.body
    )
    res.json({ user: newUser })
  } catch (error) {
    console.error(error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Updates the user in the database
 * 
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error message.
 * 
 * @returns {Object} a json user object of the updated user

 */
app.put('/updateProfile', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const currentUser = await selectUser(req)
    const { name, nickname, description } = req.body
    const result = await db.query(
      'UPDATE "user" SET name = $1, nickname = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, nickname, description, currentUser.id]
    )
    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Insert a user to the database
 *
 * @param {string} name name of the user
 * @param {string} email email of the user
 * @param {Object} formData an object with nickname and description strings
 * @returns {Object} the newly inserted user
 */
async function insertUserFromForm(name, email, formData) {
  const { nickname, description } = formData
  const results = await db.query(
    'INSERT INTO "user" (email, role, name, nickname, description, last_login) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [email, 'user', name, nickname, description, new Date()]
  )
  return results.rows[0]
}

/**
 * Get the user authorization level
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error message.
 *
 * @returns {Object} an authorization json
 */
app.get('/authorize', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }
  let user = null

  try {
    user = await selectUser(req)
  } catch (error) {
    console.log(error)
    return res.status(500).send(serverStrings.errors.generic)
  }

  const authorization = user ? user.role : 'user'

  return res.json({ authorization: authorization })
})

/**
 * Returns the events for the landing page with applied filters if given.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error message.
 *
 * @returns {[Object]} events fetched from the db, or an empty array
 */
app.get('/api/events', (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  const {
    time,
    verified,
    transportation_modes: transportationModes,
    radius,
    isArriving,
    latitude,
    longitude,
  } = req.query

  const conditions = []
  const values = []
  conditions.push(`e.event_time > NOW()`)

  if (time) {
    values.push(time)
    conditions.push(
      `e.event_time BETWEEN ($${values.length}::timestamp - interval '2 hours') AND ($${values.length}::timestamp + interval '2 hours')`
    )
  }
  if (verified === 'true') {
    conditions.push(`e.verified = true`)
  }
  if (transportationModes) {
    const modes = transportationModes.split(',')
    values.push(modes)
    conditions.push(`lower(r.transportation_mode) = ANY($${values.length})`)
  }
  conditions.push(`e.reported < 3`)
  if (radius && latitude && longitude) {
    values.push(parseFloat(longitude))
    values.push(parseFloat(latitude))
    values.push(parseFloat(radius))

    if (isArriving === 'true') {
      conditions.push(
        `ST_DWithin(e.location_geog, ST_SetSRID(ST_MakePoint($${values.length - 2}, $${values.length - 1}), 4326)::geography, $${values.length})`
      )
    } else {
      conditions.push(
        `ST_DWithin(r.origin_geog, ST_SetSRID(ST_MakePoint($${values.length - 2}, $${values.length - 1}), 4326)::geography, $${values.length})`
      )
    }
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
        res.status(500).send(serverStrings.errors.generic)
        return
      }
      res.status(200).json(results.rows)
    }
  )
})

/**
 * Updates the banner_url column in the events table for the given event.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, or the api call has an error, a 500 status code is sent with an error json {error: string}.
 * If no photo is found, a 404 page not found error is sent with an error json {error: string}.
 *
 * @returns {Object} the new banner_url fetched from the google maps API.
 */
app.post('/api/refresh-banner', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  const { placeID, eventID } = req.body
  const eventId = parseInt(eventID, 10)

  try {
    const response = await axios.get(
      `https://places.googleapis.com/v1/places/${placeID}`,
      {
        headers: {
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'photos',
        },
      }
    )

    // need the photo name to get the banner url
    const photoName = response.data.photos?.[0]?.name
    if (!photoName) {
      return res.status(404).json({ error: serverStrings.errors.noPhotos })
    }

    const photoResponse = await axios.get(
      `https://places.googleapis.com/v1/${photoName}/media`,
      {
        params: {
          maxWidthPx: 800,
          skipHttpRedirect: true,
        },
        headers: {
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    )
    const newUrl = photoResponse.data.photoUri

    db.query(
      `UPDATE event SET banner_url = $1 WHERE id = $2;`,
      [newUrl, eventId],
      error => {
        if (error) {
          console.error('Error updating DB:', error)
          return res.status(500).send(serverStrings.errors.generic)
        }
        res.status(200).json({ bannerUrl: newUrl })
      }
    )
  } catch (err) {
    const status = err.response?.status ?? 500
    const message = err.response?.data?.error?.message ?? err.message
    res.status(status).json({ error: message })
  }
})

/**
 * Requests a route from the google maps api.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the google maps api has an error, a 500 status code is sent with a json error {error: string}.
 *
 * @returns {Object} google maps route json
 */
app.post('/api/requestRoute', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const response = await axios.post(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask':
            'routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.transitDetails,routes.legs.steps.distanceMeters,routes.legs.steps.travelMode,routes.legs.steps.polyline',
        },
      }
    )
    res.json(response.data)
  } catch (err) {
    const status = err.response?.status ?? 500
    const message = err.response?.data?.error?.message ?? err.message
    res.status(status).json({ error: message })
  }
})

/**
 * Adds an event to the database
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} the newly added event
 */
app.post('/api/createEvent', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    const routeVerified = user.role === 'moderator'

    const {
      title,
      eventTime,
      location,
      needApproval,
      description,
      longitude,
      latitude,
      banner,
      placeID,
    } = req.body

    const result = await db.query(
      'INSERT INTO event (title, creator_id, event_time, location, verified, need_approval, description, created_at, location_geog, banner_url, place_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_SetSRID(ST_MakePoint($9, $10), 4326), $11, $12) RETURNING *',
      [
        title,
        user.id,
        eventTime,
        location,
        routeVerified,
        needApproval,
        description,
        new Date(),
        longitude,
        latitude,
        banner,
        placeID,
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Database Error:', error)
    res.status(500).json({ error: serverStrings.errors.eventCreationFailed })
  }
})

/**
 * Adds a route to the database
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} the newly added route
 */
app.post('/api/createRoute', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  const {
    eventID,
    title,
    transportationMode,
    origin,
    originLat,
    originLng,
    destination,
    departTime,
    maxPpl,
    distance,
    path,
    completed,
    description,
    isJoined,
  } = req.body

  const client = await pool.connect()

  try {
    const user = await selectUser(req)
    await client.query('BEGIN')

    const routeQuery = `
      INSERT INTO route (
        title, creator_id, transportation_mode, origin, destination, 
        depart_time, max_ppl, distance, path, completed, 
        description, created_at, origin_geog
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, ST_SetSRID(ST_MakePoint($13, $14), 4326))
      RETURNING id;
    `

    const routeResult = await client.query(routeQuery, [
      title,
      user.id,
      transportationMode,
      origin,
      destination,
      departTime,
      maxPpl,
      distance,
      path,
      completed,
      description,
      new Date(),
      originLng,
      originLat,
    ])

    const routeID = routeResult.rows[0].id

    const junctionQuery = `
      INSERT INTO event_route (event_id, route_id)
      VALUES ($1, $2);
    `
    await client.query(junctionQuery, [eventID, routeID])

    if (isJoined) {
      await client.query(
        'INSERT INTO user_route (user_id, route_id) VALUES ($1, $2)',
        [user.id, routeID]
      )
    }

    await client.query('COMMIT')
    res.status(201).json({ success: true, routeID })
  } catch (error) {
    console.error('Database Error Detail:', error)
    await client.query('ROLLBACK')
    res.status(500).json({ error: serverStrings.errors.routeCreationFailed })
  } finally {
    client.release()
  }
})

/**
 * Returns the routes for the landing page with applied filters if given.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {[Object]} routes fetched from the db, or an empty array
 */
app.get('/api/routes', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  const {
    time,
    transportation_modes: transportationModes,
    verified,
    radius,
    isArriving,
    latitude,
    longitude,
  } = req.query

  const conditions = []
  const values = []
  conditions.push(`r.depart_time > NOW()`)

  if (time) {
    values.push(time)
    conditions.push(
      `r.depart_time BETWEEN ($${values.length}::timestamp - interval '2 hours') AND ($${values.length}::timestamp + interval '2 hours')`
    )
  }
  if (transportationModes) {
    const modes = transportationModes.split(',')
    values.push(modes)
    conditions.push(`lower(r.transportation_mode) = ANY($${values.length})`)
  }
  if (verified === 'true') {
    conditions.push(`e.verified = true`)
  }
  if (radius && latitude && longitude) {
    values.push(parseFloat(longitude))
    values.push(parseFloat(latitude))
    values.push(parseFloat(radius))

    if (isArriving === 'true') {
      conditions.push(
        `ST_DWithin(e.location_geog, ST_SetSRID(ST_MakePoint($${values.length - 2}, $${values.length - 1}), 4326)::geography, $${values.length})`
      )
    } else {
      conditions.push(
        `ST_DWithin(r.origin_geog, ST_SetSRID(ST_MakePoint($${values.length - 2}, $${values.length - 1}), 4326)::geography, $${values.length})`
      )
    }
  }
  conditions.push(`r.reported < 3`)

  const user = await selectUser(req)
  if (user) {
    const blocked = await db.query(
      `SELECT * FROM blocked_user WHERE (blocker_id = $1) OR (blocked_user_id = $1)`,
      [user.id]
    )
    const blockedIds = blocked.rows.map(row =>
      Number(row.blocker_id) === Number(user.id)
        ? row.blocked_user_id
        : row.blocker_id
    )

    if (blockedIds.length > 0) {
      const offset = values.length + 1
      conditions.push(
        `NOT EXISTS (
          SELECT 1 FROM user_route ur
          WHERE ur.route_id = r.id
          AND ur.user_id IN (${blockedIds.map((_, i) => `$${offset + i}`).join(',')})
        )`
      )
      values.push(...blockedIds)
    }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  db.query(
    `SELECT DISTINCT r.*,
      u.id as creator_id,
      u.name as creator_name,
      u.nickname,
      u.profile_pic,
      er.event_id,   
      (SELECT COUNT(*) FROM user_route ur WHERE ur.route_id = r.id) as people_going
    FROM route r
    LEFT JOIN "user" u ON u.id = r.creator_id
    LEFT JOIN event_route er ON er.route_id = r.id
    LEFT JOIN event e ON e.id = er.event_id
    ${where}`,
    values,
    (error, results) => {
      if (error) {
        console.error('Error fetching routes:', error)
        res.status(500).send(serverStrings.errors.generic)
        return
      }
      res.status(200).json(results.rows)
    }
  )
})

/**
 * Returns event details given a specific event id.
 *
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} an event
 */
app.get('/api/eventdetail/:id', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.json({ isJoined: false })
  }

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

    const user = await selectUser(req)
    const blocked = await db.query(
      `SELECT * FROM blocked_user WHERE (blocker_id = $1) OR (blocked_user_id = $1)`,
      [user.id]
    )

    const blockedIds = blocked.rows.map(row =>
      Number(row.blocker_id) === Number(user.id)
        ? row.blocked_user_id
        : row.blocker_id
    )

    const routesResult = await db.query(
      `SELECT r.*,
      (SELECT COUNT(*) FROM user_route ur WHERE ur.route_id = r.id) as people_going
      FROM route r
      LEFT JOIN event_route er ON er.route_id = r.id
      WHERE er.event_id = $1
      ${
        blockedIds.length > 0
          ? `AND NOT EXISTS (
        SELECT 1 FROM user_route ur
        WHERE ur.route_id = r.id
        AND ur.user_id IN (${blockedIds.map((_, i) => `$${i + 2}`).join(',')})
        )`
          : ''
      }`,
      [id, ...blockedIds]
    )

    const event = eventResult.rows[0]
    event.routes = routesResult.rows

    res.status(200).json(event)
  } catch (error) {
    console.error('Error fetching event detail:', error)
    res.status(500).json({ error: serverStrings.errors.eventFetchFailed })
  }
})

/**
 * Checks if the currently authenticated user has joined a specific route.
 *
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} a json containing a boolean:
 * {
 *  isJoined: boolean
 * }
 */
app.get('/api/routes/:id/isJoined', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.json({ isJoined: false })
  }
  try {
    const user = await selectUser(req)
    const { id } = req.params
    const result = await db.query(
      'SELECT * FROM user_route WHERE route_id = $1 AND user_id = $2',
      [id, user.id]
    )
    res.json({ isJoined: result.rowCount > 0 })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: serverStrings.errors.joinStatusFailed })
  }
})

/**
 * Adds a user to a route by adding a record to the user_route table.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} {success: true}
 */
app.post('/api/routes/:id/join', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res
      .status(403)
      .json({ error: serverStrings.errors.notAuthenticated })
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
    res.status(500).json({ error: serverStrings.errors.joinFailed })
  }
})

/**
 * Removes a user from a route by removing a record from the user_route table.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} {success:  true}
 */
app.delete('/api/routes/:id/leave', async (req, res) => {
  if (!req.oidc.isAuthenticated())
    return res
      .status(403)
      .json({ error: serverStrings.errors.notAuthenticated })
  try {
    const user = await selectUser(req)
    await db.query(
      'DELETE FROM user_route WHERE user_id = $1 AND route_id = $2',
      [user.id, req.params.id]
    )
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: serverStrings.errors.leaveFailed })
  }
})

/**
 * Adds a report and corresponding report junction to report_user, report_event, or report_route.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} {success: true}
 */
app.post('/api/report', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res
      .status(403)
      .json({ error: serverStrings.errors.notAuthenticated })
  }
  try {
    const user = await selectUser(req)
    const { type, targetId, reason, explanation } = req.body

    const reportResult = await db.query(
      'INSERT INTO report (reporter_id, reason, explanation, report_target, target_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user.id, reason, explanation, type, targetId]
    )

    if (user.role === 'moderator') {
      const report = reportResult.rows[0]
      console.log(report)

      await db.query('UPDATE report SET status = $1 WHERE id = $2', [
        'approved',
        report.id,
      ])

      const table = type === 'user' ? '"user"' : type
      await db.query(
        `UPDATE ${table} SET reported = reported + 1 WHERE id = $1`,
        [targetId]
      )
    }

    res.json({ success: true })
  } catch (error) {
    if (error.code === '23505') {
      return res
        .status(400)
        .json({ error: serverStrings.errors.duplicateReport })
    }
    console.error(error)
    res.status(500).json({ error: serverStrings.errors.reportFailed })
  }
})

/**
 * Retrieves the commute history for the authenticated user.
 * - Regular users get only their participated completed routes.
 * - Admins, superadmins, moderators do not have access to detailed user commute history.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error message.
 * If the user is not in the database, a 404 error is sent with an error message.
 * If user authentication is not "user", a 403 status code is sent with an error json {error: string}.
 *
 * @returns {Object} JSON response containing commute history
 */
app.get('/api/commute-history', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    if (!user) return res.status(404).send(serverStrings.errors.noUser)

    if (user.role !== 'user') {
      return res.status(403).json({
        error: serverStrings.errors.analyticsUserOnly,
      })
    }

    const routes = await analytics.fetchCompletedRoutes(user.id, false, {
      orderByDepartTime: true,
    })

    const commuteHistory = []

    for (const route of routes) {
      const savings = await analytics.computeRouteSavings(route)
      const contributions = await analytics.toAnalyticsContributions(
        route,
        false
      )

      // Total distance now from segments
      const totalDistanceKm = contributions.reduce(
        (sum, contribution) => sum + contribution.distanceKm,
        0
      )

      // Dominant mode
      const totalsByMode = {}
      for (const contribution of contributions) {
        totalsByMode[contribution.mode] =
          (totalsByMode[contribution.mode] || 0) + contribution.distanceKm
      }

      let dominantMode = 'other'
      let maxDistance = -1

      for (const [mode, dist] of Object.entries(totalsByMode)) {
        if (dist > maxDistance) {
          dominantMode = mode
          maxDistance = dist
        }
      }

      commuteHistory.push({
        id: route.id,
        title: route.title,
        creatorId: route.creatorId,
        transportationMode: dominantMode,
        distance: analytics.roundToTwoDecimals(totalDistanceKm),

        origin: route.origin,
        destination: route.destination,
        departTime: route.departTime,
        completed: route.completed,
        maxPpl: route.maxPpl,
        description: route.description,
        path: route.path,

        savedKgUser: savings.savedKgUser,
        savedKgSystem: savings.savedKgSystem,
        context: savings.context,
      })
    }

    return res.status(200).json({
      scope: 'user',
      userId: user.id,
      count: commuteHistory.length,
      routes: commuteHistory,
    })
  } catch (error) {
    console.error('Error in /api/commute-history:', error)
    return res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Returns a summary of trips, distances, CO2 savings, and trip counts,
 * filtered based on user role (admin or user).
 * - One completed route still counts as one trip
 * - Distance and CO2 savings are distributed across multiple modes
 *   when detailed route path data exists
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error message.
 * If the user is not in the database, a 404 error is sent with an error message.
 *
 * @returns {Object} JSON response with analytics summary
 */
app.get('/api/analytics/summary', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    if (!user) return res.status(404).send(serverStrings.errors.noUser)

    const isAdmin = user.role === 'admin'
    const routes = await analytics.fetchCompletedRoutes(user.id, isAdmin)

    const summary = {
      scope: isAdmin ? 'system' : 'user',
      userId: user.id,

      tripCount: 0,
      totalDistanceKm: 0,
      totalCo2SavedKg: 0,

      tripFrequenciesByMode: {
        walk: 0,
        bicycle: 0,
        bus: 0,
        rail: 0,
        car: 0,
        other: 0,
      },
      distanceByModeKm: {
        walk: 0,
        bicycle: 0,
        bus: 0,
        rail: 0,
        car: 0,
        other: 0,
      },
      co2SavedByModeKg: {
        walk: 0,
        bicycle: 0,
        bus: 0,
        rail: 0,
        car: 0,
        other: 0,
      },
    }

    for (const route of routes) {
      const contributions = await analytics.toAnalyticsContributions(
        route,
        isAdmin
      )

      // One completed route still counts as one trip
      summary.tripCount += 1

      for (const item of contributions) {
        const mode =
          item.mode in summary.tripFrequenciesByMode ? item.mode : 'other'

        summary.totalDistanceKm += item.distanceKm
        summary.totalCo2SavedKg += item.savedKg

        summary.tripFrequenciesByMode[mode] += item.tripCount
        summary.distanceByModeKm[mode] += item.distanceKm
        summary.co2SavedByModeKg[mode] += item.savedKg
      }
    }

    summary.totalDistanceKm = analytics.roundToTwoDecimals(
      summary.totalDistanceKm
    )
    summary.totalCo2SavedKg = analytics.roundToTwoDecimals(
      summary.totalCo2SavedKg
    )

    for (const key of Object.keys(summary.distanceByModeKm)) {
      summary.distanceByModeKm[key] = analytics.roundToTwoDecimals(
        summary.distanceByModeKm[key]
      )
      summary.co2SavedByModeKg[key] = analytics.roundToTwoDecimals(
        summary.co2SavedByModeKg[key]
      )
    }

    return res.status(200).json(summary)
  } catch (error) {
    console.error('Error in /api/analytics/summary:', error)
    return res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Returns analytics grouped by transportation mode (chart-friendly array).
 * - Admins receive system-wide data across all completed routes.
 * - Users receive data only for their completed routes they participated in.
 * - A single completed route contributes distance/CO2 to multiple modes
 * - Trip count remains route-based and is assigned to the most dominant mode
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error message.
 * If the user is not in the database, a 404 error is sent with an error message.
 *
 * @returns {Object} JSON response with analytics data grouped by commute type
 */
app.get('/api/analytics/by-mode', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    if (!user) return res.status(404).send(serverStrings.errors.noUser)

    const isAdmin = user.role === 'admin'
    const routes = await analytics.fetchCompletedRoutes(user.id, isAdmin)

    const aggregates = {
      walk: {
        mode: 'walk',
        tripCount: 0,
        totalDistanceKm: 0,
        totalCo2SavedKg: 0,
      },
      bicycle: {
        mode: 'bicycle',
        tripCount: 0,
        totalDistanceKm: 0,
        totalCo2SavedKg: 0,
      },
      bus: {
        mode: 'bus',
        tripCount: 0,
        totalDistanceKm: 0,
        totalCo2SavedKg: 0,
      },
      rail: {
        mode: 'rail',
        tripCount: 0,
        totalDistanceKm: 0,
        totalCo2SavedKg: 0,
      },
      car: {
        mode: 'car',
        tripCount: 0,
        totalDistanceKm: 0,
        totalCo2SavedKg: 0,
      },
      other: {
        mode: 'other',
        tripCount: 0,
        totalDistanceKm: 0,
        totalCo2SavedKg: 0,
      },
    }

    for (const route of routes) {
      const contributions = await analytics.toAnalyticsContributions(
        route,
        isAdmin
      )

      for (const item of contributions) {
        const modeStats = aggregates[item.mode] || aggregates.other
        modeStats.tripCount += item.tripCount
        modeStats.totalDistanceKm += item.distanceKm
        modeStats.totalCo2SavedKg += item.savedKg
      }
    }

    const data = ['walk', 'bicycle', 'bus', 'rail', 'car', 'other'].map(key => {
      const item = aggregates[key]
      return {
        mode: item.mode,
        tripCount: item.tripCount,
        totalDistanceKm: analytics.roundToTwoDecimals(item.totalDistanceKm),
        totalCo2SavedKg: analytics.roundToTwoDecimals(item.totalCo2SavedKg),
      }
    })

    return res.status(200).json({
      scope: isAdmin ? 'system' : 'user',
      userId: user.id,
      data,
    })
  } catch (error) {
    console.error('Error in /api/analytics/by-mode:', error)
    return res.status(500).send(serverStrings.errors.generic)
  }
})

if (require.main === module) {
  app.listen(port, () => {
    console.log(`GCCB Backend listening on port ${port}`)
  })
}

/**
 * Returns reports to be reviewed by the moderator.
 *
 * If the database has an error, a 500 status code is sent with an error message.
 *
 * @returns {[Object]} pending reports, or an empty array
 */
app.get('/api/reports', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM report
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `)

    // get report details for user, event, and route respectively
    const reports = await Promise.all(
      result.rows.map(async report => {
        let targetDetails = null

        if (report.report_target === 'user') {
          const res = await db.query('SELECT * FROM "user" WHERE id = $1', [
            report.target_id,
          ])
          targetDetails = res.rows[0]
        } else if (report.report_target === 'event') {
          const res = await db.query('SELECT * FROM event WHERE id = $1', [
            report.target_id,
          ])
          targetDetails = res.rows[0]
        } else if (report.report_target === 'route') {
          const res = await db.query(
            `SELECT 
              r.*, 
              er.event_id,
              (SELECT COUNT(*) FROM user_route ur WHERE ur.route_id = r.id) as people_going
            FROM route r 
            LEFT JOIN event_route er ON r.id = er.route_id 
            WHERE r.id = $1`,
            [report.target_id]
          )
          targetDetails = res.rows[0]
        }

        return { ...report, targetDetails }
      })
    )

    res.status(200).json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Returns the routes the user has joined.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error message.
 * If the user is not in the database, a 404 error is sent with an error json {error: string}.
 *
 * @returns {[Object]} an array of trips a user has joined (via user_route junction table), or an empty array
 */
app.get('/api/my-trips', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    if (!user)
      return res.status(404).json({ error: serverStrings.errors.noUser })

    // "completed" column in route table temporarily overridden by computing "completed" based on event's event_time
    // while we decide how to compute if a route has been completed (button vs. automatic).
    // TODO: decide on permanent approach: DB trigger or node-cron job to update the completed
    // column automatically, or dedicated endpoint if the user needs to manually mark a trip complete.
    const query = `
      SELECT r.*, 
             e.event_time,
             (SELECT COUNT(*) FROM user_route ur2 WHERE ur2.route_id = r.id) as people_going,
             (e.event_time < NOW()) AS completed
      FROM route r
      INNER JOIN user_route ur ON ur.route_id = r.id
      LEFT JOIN event_route er ON r.id = er.route_id
      LEFT JOIN event e on e.id = er.event_id
      WHERE ur.user_id = $1
      ORDER BY r.depart_time DESC
    `

    const results = await db.query(query, [user.id])
    res.status(200).json(results.rows)
  } catch (error) {
    console.error('Error fetching my trips:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Submits a report. On approval of a valid report, status gets changed to "approved"
 * and the reported event/route/user reported column gets incremented by 1.
 * On rejection of an invalid report, status gets changed to "rejected" and the
 * rejection reason and optional detail (text) is saved.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error message.
 *
 * @returns {Object} {success: true}
 */
app.post('/api/moderateReport', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const {
      report_id: reportID,
      report_target: reportTarget,
      target_id: targetID,
      rejection_reason: rejectionReason,
      rejection_detail: rejectionDetail,
      status,
    } = req.body

    // update the report
    await db.query(
      'UPDATE report SET status = $1, rejection_reason = $2, rejection_detail = $3 WHERE id = $4',
      [status, rejectionReason, rejectionDetail, reportID]
    )

    // increment reported count on target if approved
    if (status === 'approved') {
      const table = reportTarget === 'user' ? '"user"' : reportTarget
      await db.query(
        `UPDATE ${table} SET reported = reported + 1 WHERE id = $1`,
        [targetID]
      )
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Database Error:', error)
    res.status(500).json({ error: serverStrings.errors.internal })
  }
})

/**
 * Verifies an event.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 * If the user is not in the database, a 404 error is sent with an error json {error: string}.
 *
 * @returns {Object} {success: true}
 */
app.post('/api/verifyEvent', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    if (!user)
      return res.status(404).json({ error: serverStrings.errors.noUser })

    const {
      event_id: eventID,
      status,
      rejection_reason: rejectionReason,
      rejection_detail: rejectionDetail,
    } = req.body

    // update the event_verification_table
    await db.query(
      'UPDATE event_verification SET status = $1, rejection_reason = $2, rejection_detail = $3, verified_by = $4, verified_at = NOW() WHERE event_id = $5',
      [status, rejectionReason, rejectionDetail, user.id, eventID]
    )

    // update the actual event
    if (status == 'approved') {
      await db.query('UPDATE event SET verified = true WHERE id = $1', [
        eventID,
      ])
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Database Error:', error)
    res.status(500).json({ error: serverStrings.errors.internal })
  }
})

/**
 * Returns events to be verified by the moderator.
 *
 * If the database has an error, a 500 status code is sent with an error message.
 *
 * @returns {[Object]} pending verifications, or an empty array
 */
app.get('/api/pendingVerifications', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ev.event_id, e.* FROM event_verification ev
      LEFT JOIN "event" e ON e.id = ev.event_id
      WHERE ev.status = 'pending'
      ORDER BY ev.verified_at ASC
    `)

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching pending verifications:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Returns platform activity summary for the admin dashboard.
 * Admin-only. Returns KPIs and route status/rejection breakdowns.
 * Arbitrary rolling time frames used:
 * - # of routes created within 7 days
 * - # of routes completed within 30 days
 * - # of routes rejected within 30 days
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error message.
 * If the user is not in the database, a 404 error is sent with an error message.
 * If user authentication is not "admin", a 403 status code is sent with an error message.
 *
 * @returns {Object} kpis, statusBreakdown, rejectionReasons
 */
app.get('/api/activity/summary', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  const client = await pool.connect()

  try {
    const user = await selectUser(req)
    if (!user) return res.status(404).send(serverStrings.errors.noUser)

    if (user.role !== 'admin') {
      return res.status(403).send(serverStrings.errors.accessDenied)
    }

    const [
      creatorsRes,
      completionRes,
      rejectedRes,
      statusRes,
      rejectionRes,
      groupSizeRes,
    ] = await Promise.all([
      client.query(`
        SELECT COUNT(DISTINCT creator_id)::int AS count
        FROM route
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `),
      client.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE completed = true)::int AS completed
        FROM route
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `),
      client.query(`
        SELECT COUNT(*)::int AS count
        FROM route
        WHERE rejection_reason IS NOT NULL
          AND created_at >= NOW() - INTERVAL '30 days'
      `),
      client.query(`
        SELECT
          COUNT(*) FILTER (
            WHERE completed = false
              AND rejection_reason IS NULL
              AND depart_time > NOW()
          )::int AS upcoming,
          COUNT(*) FILTER (WHERE completed = true)::int AS completed,
          COUNT(*) FILTER (WHERE rejection_reason IS NOT NULL)::int AS rejected
        FROM route
      `),
      client.query(`
        SELECT
          rejection_reason AS reason,
          COUNT(*)::int AS count
        FROM route
        WHERE rejection_reason IS NOT NULL
        GROUP BY rejection_reason
        ORDER BY count DESC
      `),
      client.query(`
        SELECT ROUND(AVG(participant_count)::numeric, 1) AS avg_group_size
        FROM (
          SELECT route_id, COUNT(*)::int AS participant_count
          FROM user_route
          WHERE route_id IN (SELECT id FROM route WHERE completed = true)
          GROUP BY route_id
        ) counts
      `),
    ])

    const { total: total30d, completed: completed30d } = completionRes.rows[0]

    return res.status(200).json({
      kpis: {
        activeCreators7d: creatorsRes.rows[0]?.count ?? 0,
        completionRate30d:
          total30d > 0 ? Math.round((completed30d / total30d) * 100) : 0,
        rejectedRoutes30d: rejectedRes.rows[0]?.count ?? 0,
        avgGroupSize: Number(groupSizeRes.rows[0]?.avg_group_size ?? 0),
      },
      statusBreakdown: {
        upcoming: statusRes.rows[0]?.upcoming ?? 0,
        completed: statusRes.rows[0]?.completed ?? 0,
        rejected: statusRes.rows[0]?.rejected ?? 0,
      },
      rejectionReasons: rejectionRes.rows.map(row => ({
        reason: row.reason,
        count: row.count,
      })),
    })
  } catch (error) {
    console.error('Error in /api/activity/summary:', error)
    return res.status(500).send(serverStrings.errors.generic)
  } finally {
    client.release()
  }
})

/**
 * Returns CO₂e baseline vs actual emissions grouped by time period.
 * Admin-only. Used for the time-series chart on the Activity page.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error message.
 * If the database has an error, a 500 status code is sent with an error message.
 * If the user is not in the database, a 404 error is sent with an error message.
 * If user authentication is not "admin", a 403 status code is sent with an error message.
 *
 * @returns {Object} granularity and array of { period, baselineKg, actualKg, savedKg }
 */
app.get('/api/activity/co2-timeseries', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  const client = await pool.connect()

  try {
    const user = await selectUser(req)
    if (!user) return res.status(404).send(serverStrings.errors.noUser)

    if (user.role !== 'admin') {
      return res.status(403).send(serverStrings.errors.accessDenied)
    }

    const granularity = ['daily', 'monthly', 'quarterly'].includes(
      req.query.granularity
    )
      ? req.query.granularity
      : 'daily'

    const routes = await analytics.fetchCompletedRoutes(user.id, true)

    if (routes.length === 0) {
      return res.status(200).json({ granularity, data: [] })
    }

    const routeIds = routes.map(r => r.id)
    const participantRes = await client.query(
      `SELECT
         ur.route_id,
         COUNT(*)::int AS participant_count,
         BOOL_OR(ur.user_id = r.creator_id) AS creator_included
       FROM user_route ur
       JOIN route r ON r.id = ur.route_id
       WHERE ur.route_id = ANY($1)
       GROUP BY ur.route_id, r.creator_id`,
      [routeIds]
    )

    const participantMap = {}
    for (const row of participantRes.rows) {
      const count = row.creator_included
        ? row.participant_count
        : row.participant_count + 1
      participantMap[row.route_id] = count
    }

    function getPeriodKey(date) {
      const calendarDate = new Date(date)
      const year = calendarDate.getFullYear()
      const month = String(calendarDate.getMonth() + 1).padStart(2, '0')
      const day = String(calendarDate.getDate()).padStart(2, '0')

      if (granularity === 'daily') return `${year}-${month}-${day}`
      if (granularity === 'monthly') return `${year}-${month}`
      const quarter = Math.ceil((calendarDate.getMonth() + 1) / 3)
      return `${year}-Q${quarter}`
    }

    const periodMap = {}

    for (const route of routes) {
      const savings = await analytics.computeRouteSavings(route)
      const participants = participantMap[route.id] ?? 1
      const distanceKm = Number(route.distance) || 0

      const baselineKg = analytics.roundToTwoDecimals(
        (participants * distanceKm * EMISSIONS_G_PER_KM.CAR_VEHICLE.PETROL) /
          1000
      )
      const savedKg = savings.savedKgSystem
      const actualKg = analytics.roundToTwoDecimals(
        Math.max(0, baselineKg - savedKg)
      )

      const key = getPeriodKey(route.departTime)

      if (!periodMap[key]) {
        periodMap[key] = { period: key, baselineKg: 0, actualKg: 0, savedKg: 0 }
      }

      periodMap[key].baselineKg = analytics.roundToTwoDecimals(
        periodMap[key].baselineKg + baselineKg
      )
      periodMap[key].actualKg = analytics.roundToTwoDecimals(
        periodMap[key].actualKg + actualKg
      )
      periodMap[key].savedKg = analytics.roundToTwoDecimals(
        periodMap[key].savedKg + savedKg
      )
    }

    const data = Object.values(periodMap).sort((a, b) =>
      a.period.localeCompare(b.period)
    )

    return res.status(200).json({ granularity, data })
  } catch (error) {
    console.error('Error in /api/activity/co2-timeseries:', error)
    return res.status(500).send(serverStrings.errors.generic)
  } finally {
    client.release()
  }
})

/**
 * Returns banned users or blocked users depending on user's role.
 *
 * If the database has an error, a 500 status code is sent with an error message.
 *
 * @returns {[Object]} banned users, or an empty array
 */
app.get('/api/bannedUsers', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    let result
    if (!user) {
      return res.status(404).json({ error: serverStrings.errors.noUser })
    }

    if (user.role === 'moderator') {
      result = await db.query(`
      SELECT * FROM "user"
      WHERE reported > 3
      ORDER BY name
    `)
    } else {
      result = await db.query(
        `
        SELECT u.* FROM blocked_user bu
        LEFT JOIN "user" u ON u.id = bu.blocked_user_id
        WHERE bu.blocker_id = $1
        ORDER BY u.name
      `,
        [user.id]
      )
    }

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Unbans or unblocks a user depending on their role.
 *
 * If the database has an error, a 500 status code is sent with an error message.
 */
app.post('/api/unbanUser/:userId', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    let result
    if (!user) {
      return res.status(404).json({ error: serverStrings.errors.noUser })
    }

    if (user.role === 'moderator') {
      result = await db.query(
        `
      UPDATE "user"
      SET reported = 0
      WHERE id = $1
      RETURNING * 
    `,
        [req.params.userId]
      )
    } else {
      result = await db.query(
        `
        DELETE FROM blocked_user
        WHERE blocker_id = $1 AND blocked_user_id = $2
        RETURNING *
      `,
        [user.id, req.params.userId]
      )
    }

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error unbanning user:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

module.exports = app
