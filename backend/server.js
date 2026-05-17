const path = require('path')
const dotenv = require('dotenv')

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: path.join(__dirname, envFile) })
const express = require('express')
const { auth } = require('express-openid-connect')
const cors = require('cors')
const axios = require('axios')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')
const { serverStrings } = require('./locales/en/serverLocales')
const { createServer } = require('http')

const app = express()
const httpServer = createServer(app)
const db = require('./db')
const pool = db.pool
const port = 3000

const { analyticsServices } = require('./src/services/AnalyticsServices')
const { BadgeServices } = require('./src/services/BadgeServices')
const { BadgeEvaluator } = require('./src/services/BadgeEvaluator')
const { initSocket, broadcast } = require('./sockets/ChatSocket')
const chatService = require('./src/services/ChatServices')
const { selectUser } = require('./src/utils/UserUtils')
const { notificationRouter } = require('./endpoints/NotificationEndpoints')
const { sendNotification } = require('./src/utils/NotificationUtils')
const { NotificationType } = require('../shared/NotificationTypes')

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL || `http://localhost:${port}`,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gccb_profile_pics',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
})

const upload = multer({ storage: storage })

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.use(
  auth({
    ...config,
    session: {
      cookie: {
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  })
)

app.use(express.json())
app.use('/api/chat', require('./endpoints/ChatEndpoints'))
app.use('/api', require('./endpoints/AnalyticsEndpoints'))
app.use('/api', require('./endpoints/ActivityEndpoints'))

const badgeServices = new BadgeServices({ db })
const badgeEvaluator = new BadgeEvaluator({ badgeQueries: badgeServices })
setInterval(async () => {
  await db.query(`
    UPDATE route
    SET completed = TRUE
    WHERE completed = FALSE
    AND depart_time < NOW()
  `)

  const upcomingRoutes = await db.query(`
    SELECT id, title FROM route
    WHERE completed = FALSE
    AND depart_time BETWEEN NOW() AND NOW() + INTERVAL '15 minutes'
    AND NOT EXISTS (
      SELECT 1 FROM notification
      WHERE notification.route_id = route.id
      AND notification.metadata->>'message' ILIKE '%depart%'
    )
  `)

  for (const route of upcomingRoutes.rows) {
    await sendNotification(
      NotificationType.Route,
      route.id,
      route.title,
      null,
      serverStrings.routeDepartSoon,
      false,
      true
    )
  }
}, 60 * 1000)

app.use('/notifications', notificationRouter)

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
  const returnTo = req.query.returnTo || process.env.FRONTEND_URL
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
  const returnTo = req.query.returnTo || process.env.FRONTEND_URL
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
app.post('/createNewUser', upload.single('file'), async (req, res) => {
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
      req.body,
      req.file
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
app.put('/updateProfile', upload.single('file'), async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const currentUser = await selectUser(req)
    const { name, nickname, description } = req.body

    let imageUrl = req.body.imageUrl
    if (req.file) {
      imageUrl = req.file.path
    }

    const result = await db.query(
      'UPDATE "user" SET name = $1, nickname = $2, description = $3, profile_pic = $4 WHERE id = $5 RETURNING *',
      [name, nickname, description, imageUrl, currentUser.id]
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
 * @param {Object} file profile image of the user
 * @returns {Object} the newly inserted user
 */
async function insertUserFromForm(name, email, formData, file) {
  const { nickname, description } = formData
  const imageUrl = file ? file.path : null

  const results = await db.query(
    'INSERT INTO "user" (email, role, name, nickname, description, profile_pic, last_login) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [email, 'user', name, nickname, description, imageUrl, new Date()]
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
 * Inserts a new route into the database
 *
 * @param {client} pg client from the connection pool
 * @param {eventID} eventID of the event the route is associated with
 * @param {creatorID} userID of the route creator
 * @param {routeData} object containing the route data
 * @param {isJoined} boolean indicating whether the creator has joined the route
 * @returns
 */
const insertRoute = async (client, eventID, creatorID, routeData, isJoined) => {
  const {
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
  } = routeData

  // Frontend sends distance in metres; convert to km for backend analytics
  const distanceKm = Number(distance) / 1000

  const routeResult = await client.query(
    `INSERT INTO route (
      title, creator_id, transportation_mode, origin, destination,
      depart_time, max_ppl, distance, path, completed,
      description, created_at, origin_geog
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, ST_SetSRID(ST_MakePoint($13, $14), 4326))
    RETURNING id`,
    [
      title,
      creatorID,
      transportationMode,
      origin,
      destination,
      departTime,
      maxPpl,
      distanceKm,
      path,
      completed,
      description,
      new Date(),
      originLng,
      originLat,
    ]
  )

  const routeID = routeResult.rows[0].id

  await client.query(
    'INSERT INTO event_route (event_id, route_id) VALUES ($1, $2)',
    [eventID, routeID]
  )

  if (isJoined) {
    await client.query(
      'INSERT INTO user_route (user_id, route_id) VALUES ($1, $2)',
      [creatorID, routeID]
    )
  }

  return routeID
}

/**
 * Adds an event and optional route to the database
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

  const client = await pool.connect()

  try {
    const user = await selectUser(req)
    const eventVerified = user.role === 'moderator'

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
      route,
    } = req.body

    let bannerUrl = null
    if (banner) {
      try {
        const uploadResult = await cloudinary.uploader.upload(banner, {
          folder: 'gccb_event_banners',
          allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
          transformation: [{ width: 1200, height: 400, crop: 'fill' }],
        })
        bannerUrl = uploadResult.secure_url
      } catch (uploadError) {
        console.error(serverStrings.errors.cloudinaryFailed, uploadError)
      }
    }

    await client.query('BEGIN')

    const eventResult = await client.query(
      `INSERT INTO event (title, creator_id, event_time, location, verified, need_approval, description, created_at, location_geog, banner_url, place_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_SetSRID(ST_MakePoint($9, $10), 4326), $11, $12) 
       RETURNING *`,
      [
        title,
        user.id,
        eventTime,
        location,
        eventVerified,
        needApproval,
        description,
        new Date(),
        longitude,
        latitude,
        bannerUrl,
        placeID,
      ]
    )

    const newEvent = eventResult.rows[0]
    if (route) {
      const routeID = await insertRoute(
        client,
        newEvent.id,
        user.id,
        route,
        route.isJoined
      )

      // create chatroom and add creator as first member
      const chatCloseTime = route.departTime
      const { rows: chatroomRows } = await client.query(
        `INSERT INTO chatroom (route_id, close_at, delete_at) VALUES ($1, $2::timestamp, $2::timestamp + interval '2 days') RETURNING id`,
        [routeID, chatCloseTime]
      )
      const chatroomID = chatroomRows[0].id

      await client.query(
        `INSERT INTO chatroom_member (chatroom_id, user_id) VALUES ($1, $2)`,
        [chatroomID, user.id]
      )
    }
    await client.query('COMMIT')

    // Evaluate Social badges if a route was created with this event
    if (route) {
      try {
        const summary = await analyticsServices.buildAnalyticsSummary(
          user.id,
          false
        )
        await badgeEvaluator.evaluateBadges(user.id, summary)
      } catch (err) {
        console.error('Badge evaluation failed (createEvent):', err)
        // 500 error here would mean that badge evaluation failed, not that the route itself was lost.
        return res
          .status(500)
          .json({ error: serverStrings.errors.badgeEvaluationFailed })
      }
    }

    res.status(201).json(newEvent)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Database Error:', error)
    res.status(500).json({ error: serverStrings.errors.eventCreationFailed })
  } finally {
    client.release()
  }
})

/**
 * Adds a route to the database
 * Also creates a chatroom for the route and adds the creator as the first member of the chatroom.
 * The chatroom's close_at is set to the route's depart_time, and delete_at is set to 2 days after the depart_time.
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

  const { eventID, isJoined, ...routeData } = req.body
  const client = await pool.connect()

  try {
    const user = await selectUser(req)
    await client.query('BEGIN')

    const routeID = await insertRoute(
      client,
      eventID,
      user.id,
      routeData,
      isJoined
    )
    await chatService.createNewRoom(
      client,
      routeID,
      user.id,
      routeData.departTime
    )

    await client.query('COMMIT')

    // Await badge evaluation so Social badges reflect the new route immediately
    try {
      const summary = await analyticsServices.buildAnalyticsSummary(
        user.id,
        false
      )
      await badgeEvaluator.evaluateBadges(user.id, summary)
    } catch (err) {
      console.error('Badge evaluation failed (createRoute):', err)
      // 500 error here would mean that badge evaluation failed, not that the route itself was lost.
      return res
        .status(500)
        .json({ error: serverStrings.errors.badgeEvaluationFailed })
    }

    res.status(201).json({ success: true, routeID })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Database Error Detail:', error)
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

  let currentUserId = null
  if (req.oidc.isAuthenticated()) {
    const user = await selectUser(req)
    currentUserId = user.id
  }

  try {
    const eventResult = await db.query(
      `SELECT e.*, 
        u.id as creator_id,
        u.name as creator_name, 
        u.nickname, 
        u.profile_pic,
        u.role,
        u.description AS creator_description
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
      (SELECT COUNT(*) FROM user_route ur WHERE ur.route_id = r.id) as people_going,
        EXISTS (
          SELECT 1 FROM user_route ur 
          WHERE ur.route_id = r.id AND ur.user_id = $2
        ) as "isJoined"
      FROM route r
      LEFT JOIN event_route er ON er.route_id = r.id
      WHERE er.event_id = $1
      AND r.reported < 3
      AND r.depart_time > NOW()
      ${
        blockedIds.length > 0
          ? `AND NOT EXISTS (
        SELECT 1 FROM user_route ur
        WHERE ur.route_id = r.id
        AND ur.user_id IN (${blockedIds.map((_, i) => `$${i + 3}`).join(',')})
        )`
          : ''
      }`,
      [id, currentUserId, ...blockedIds]
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
 * Also adds the user to the associated chatroom and broadcasts a system message to the chatroom that a new member has joined.s
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
    const routeId = req.params.id

    const result = await db.query('SELECT title FROM route WHERE id = $1', [
      routeId,
    ])
    await sendNotification(
      NotificationType.Route,
      routeId,
      result.rows[0]?.title,
      user.id,
      `${user.nickname} ${serverStrings.userJoined}`
    )

    await db.query(
      'INSERT INTO user_route (user_id, route_id) VALUES ($1, $2)',
      [user.id, routeId]
    )

    const chatroomRes = await db.query(
      'SELECT id FROM chatroom WHERE route_id = $1',
      [routeId]
    )

    if (chatroomRes.rowCount > 0) {
      const chatroomId = chatroomRes.rows[0].id
      const newMember = await chatService.addUserToRoom(chatroomId, user.id)
      broadcast(chatroomId, 'MEMBER_JOINED', {
        userId: newMember.data.id,
        userNickname: newMember.data.nickname,
      })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error joining route/chat:', error)
    res.status(500).json({ error: serverStrings.errors.joinFailed })
  }
})

/**
 * Deletes a route, removes all associated user_route and event_route records, deletes the associated chatroom and messages.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} {success: true}
 */
app.delete('/api/routes/:id/delete', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res
      .status(403)
      .json({ error: serverStrings.errors.notAuthenticated })
  }

  const client = await pool.connect()

  try {
    const routeId = req.params.id
    const user = await selectUser(req)
    await client.query('BEGIN')
    const chatroomId = await chatService.deleteRoom(client, routeId)
    broadcast(chatroomId, 'ROOM_DELETED', { chatroomId })
    const result = await client.query('SELECT title FROM route WHERE id = $1', [
      routeId,
    ])
    await sendNotification(
      NotificationType.Route,
      routeId,
      result.rows[0]?.title,
      user.id,
      serverStrings.routeDeleted,
      true
    )
    await client.query('DELETE FROM event_route WHERE route_id = $1', [routeId])
    await client.query('DELETE FROM user_route WHERE route_id = $1', [routeId])
    await client.query('DELETE FROM route WHERE id = $1', [routeId])
    await client.query('COMMIT')
    res.json({ success: true })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Route deletion error:', error)
    res.status(500).json({ error: serverStrings.errors.routeDeletionFailed })
  } finally {
    client.release()
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
  if (!req.oidc.isAuthenticated()) {
    return res
      .status(403)
      .json({ error: serverStrings.errors.notAuthenticated })
  }

  try {
    const user = await selectUser(req)
    const routeId = req.params.id

    const chatroomRes = await db.query(
      'SELECT id FROM chatroom WHERE route_id = $1',
      [routeId]
    )

    const result = await db.query('SELECT title FROM route WHERE id = $1', [
      routeId,
    ])
    await sendNotification(
      NotificationType.Route,
      routeId,
      result.rows[0]?.title,
      user.id,
      `${user.nickname} ${serverStrings.userLeft}`
    )

    await db.query(
      'DELETE FROM user_route WHERE user_id = $1 AND route_id = $2',
      [user.id, routeId]
    )

    if (chatroomRes.rowCount > 0) {
      const chatroomId = chatroomRes.rows[0].id
      await chatService.removeUserFromRoom(chatroomId, user.id)
      broadcast(chatroomId, 'MEMBER_LEFT', {
        userId: user.id,
        userNickname: user.nickname,
      })
    }

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: serverStrings.errors.leaveFailed })
  }
})

/**
 * Creates a report.
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
app.get('/api/myTrips', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    if (!user)
      return res.status(404).json({ error: serverStrings.errors.noUser })

    const query = `
      SELECT r.*, 
             e.event_time,
             (SELECT COUNT(*) FROM user_route ur2 WHERE ur2.route_id = r.id) as people_going,
             ur.completed
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
 * Returns the joined participants for a selected route.
 *
 * If the database has an error, a 500 status code is sent with an error message.
 *
 * @returns {[Object]} joined participants for a given route, or an empty array
 */
app.get('/api/getParticipants/:routeId', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  const { routeId } = req.params

  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.nickname, u.profile_pic, u.role, u.description, u.active
       FROM user_route ur
       JOIN "user" u ON u.id = ur.user_id
       WHERE ur.route_id = $1`,
      [routeId]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching participants:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Sets completed column to true for a user_route row.
 * Evaluates badge progress (once route marked completed) for the user
 * and awards any newly earned badges; upserts progress for the rest.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} {success: true}
 */
app.post('/api/completeRoute', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res
      .status(403)
      .json({ error: serverStrings.errors.notAuthenticated })
  }

  const { routeID } = req.body

  try {
    const user = await selectUser(req)
    await db.query(
      'UPDATE user_route SET completed = true WHERE user_id = $1 AND route_id = $2',
      [user.id, routeID]
    )

    analyticsServices
      .buildAnalyticsSummary(user.id, false)
      .then(summary => badgeEvaluator.evaluateBadges(user.id, summary))
      .catch(err => console.error('Badge evaluation failed:', err))

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: serverStrings.errors.routeCompletionFailed })
  }
})

/**
 * Returns all badges for the authenticated user with earned status and progress.
 *
 * @returns {{ badges: Object[] }}
 */
app.get('/api/badges/:userId', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res
      .status(403)
      .json({ error: serverStrings.errors.notAuthenticated })
  }

  const { userId } = req.params
  try {
    const badges = await badgeEvaluator.getBadgesForUser(userId)
    res.json({ badges })
  } catch (error) {
    console.error('Error fetching badges:', error)
    res.status(500).json({ error: serverStrings.errors.generic })
  }
})

/**
 * Returns banned users or blocked users depending on user's role.
 * Returns banned users, users reported more than 3 times. Moderator access only.
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
    if (!user) {
      return res.status(404).json({ error: serverStrings.errors.noUser })
    }
    if (user.role !== 'moderator') {
      return res.status(403).send(serverStrings.errors.accessDenied)
    }

    const result = await db.query(`
      SELECT * FROM "user"
      WHERE reported > 3
      ORDER BY name
    `)

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching banned users:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Returns users blocked by the authenticated user.
 *
 * If the database has an error, a 500 status code is sent with an error message.
 *
 * @returns {[Object]} blocked users, or an empty array
 */
app.get('/api/blockedUsers', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    if (!user) {
      return res.status(404).json({ error: serverStrings.errors.noUser })
    }

    const result = await db.query(
      `
      SELECT u.* FROM blocked_user bu
      LEFT JOIN "user" u ON u.id = bu.blocked_user_id
      WHERE bu.blocker_id = $1
      ORDER BY u.name
      `,
      [user.id]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching blocked users:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Resets the reported count for a user, unbanning them. Moderator access only.
 *
 * If the database has an error, a 500 status code is sent with an error message.
 */
app.post('/api/unbanUser/:userId', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    if (!user) {
      return res.status(404).json({ error: serverStrings.errors.noUser })
    }
    if (user.role !== 'moderator') {
      return res.status(403).send(serverStrings.errors.accessDenied)
    }

    const result = await db.query(
      `
      UPDATE "user"
      SET reported = 0
      WHERE id = $1
      RETURNING *
      `,
      [req.params.userId]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error unbanning user:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Removes the block between the authenticated user and the specified user.
 *
 * If the database has an error, a 500 status code is sent with an error message.
 */
app.post('/api/unblockUser/:userId', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  try {
    const user = await selectUser(req)
    if (!user) {
      return res.status(404).json({ error: serverStrings.errors.noUser })
    }

    const result = await db.query(
      `
      DELETE FROM blocked_user
      WHERE blocker_id = $1 AND blocked_user_id = $2
      RETURNING *
      `,
      [user.id, req.params.userId]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error unblocking user:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Blocks a specific user.
 *
 * @param {number} req.body.blocked_user_id - The ID of the user to block.
 */
app.post('/api/blockUser/:userId', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  const blockedUserId = req.params.userId
  const currentUser = await selectUser(req)
  const blockerId = currentUser.id

  try {
    await db.query(
      `INSERT INTO "blocked_user" (blocker_id, blocked_user_id) 
       VALUES ($1, $2)
       ON CONFLICT (blocker_id, blocked_user_id) DO NOTHING`,
      [blockerId, blockedUserId]
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Error blocking user:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Checks if a specific user is blocked by the current user.
 *
 * @param {number} req.params.id - The ID of the user to check.
 * @returns {{ isBlocked: boolean }}
 */
app.get('/api/blockStatus/:id', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  const blockedUserId = req.params.id
  const currentUser = await selectUser(req)

  try {
    const result = await db.query(
      `SELECT 1 FROM blocked_user WHERE blocker_id = $1 AND blocked_user_id = $2`,
      [currentUser.id, blockedUserId]
    )

    res.json({ isBlocked: result.rows.length > 0 })
  } catch (error) {
    console.error('Error checking block status:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Checks if a specific user is reported by the current user.
 *
 * @param {number} req.params.id - The ID of the user to check.
 * @returns {{ isReported: boolean }}
 */
app.get('/api/reportStatus/:id', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }

  const blockedUserId = req.params.id
  const currentUser = await selectUser(req)

  try {
    const result = await db.query(
      `SELECT 1 FROM report WHERE reporter_id = $1 AND report_target = 'user' AND target_id = $2`,
      [currentUser.id, blockedUserId]
    )

    res.json({ isReported: result.rows.length > 0 })
  } catch (error) {
    console.error('Error checking report status:', error)
    res.status(500).send(serverStrings.errors.generic)
  }
})

initSocket(httpServer)
console.log('Sockets initialized')

if (require.main === module) {
  httpServer.listen(port, () => {
    console.log(`Server & Sockets integrated on port ${port}`)
  })
}

module.exports = { app, httpServer }
