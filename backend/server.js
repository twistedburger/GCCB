require('dotenv').config({ path: __dirname + '/.env' })
const express = require('express')
const { auth } = require('express-openid-connect')
const cors = require('cors')
const { serverStrings } = require('./locales/en/serverLocales')

const app = express()
const db = require('./db')
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

const analytics = createAnalyticsHelpers({
  db,
  co2Calculator: defaultCo2Calculator,
  emissions: { EMISSIONS_G_PER_KM },
})

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
  const isAuthenticated = req.oidc.isAuthenticated()
  const ssoProfile = req.oidc.user || null

  if (!isAuthenticated) {
    return res.json({ isAuthenticated: false, user: null })
  }

  try {
    const dbUser = await selectUser(req)
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
    return res.status(500).send(serverStrings.errors.generic)
  }
})

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

async function insertUserFromForm(name, email, formData) {
  const { nickname, description } = formData
  const results = await db.query(
    'INSERT INTO "user" (email, role, name, nickname, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [email, 'user', name, nickname, description]
  )
  return results.rows[0]
}

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
        res.status(500).send(serverStrings.errors.generic)
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
        res.status(500).send(serverStrings.errors.generic)
        return
      }
      console.log('Routes fetched:', results.rows)
      res.status(200).json(results.rows)
    }
  )
})

/**
 * Retrieves the commute history for the authenticated user.
 * - Regular users get only their participated completed routes.
 * - Admins do not have access to detailed commute history.
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

    const isAdmin = user.role === 'admin'

    if (isAdmin) {
      return res.status(403).json({
        error: 'Admins do not have access to user commute history.',
      })
    }

    const routes = await analytics.fetchCompletedRoutes(user.id, false, {
      orderByDepartTime: true,
    })

    const commuteHistory = []
    for (const r of routes) {
      const savings = await analytics.computeRouteSavings(r)

      commuteHistory.push({
        id: r.id,
        title: r.title,
        creator_id: r.creator_id,
        transportation_mode: r.transportation_mode,
        origin: r.origin,
        destination: r.destination,
        distance: r.distance,
        depart_time: r.depart_time,
        completed: r.completed,
        max_ppl: r.max_ppl,
        description: r.description,
        path: r.path,

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

      tripFrequenciesByMode: { walk: 0, bicycle: 0, bus: 0, car: 0, other: 0 },
      distanceByModeKm: { walk: 0, bicycle: 0, bus: 0, car: 0, other: 0 },
      co2SavedByModeKg: { walk: 0, bicycle: 0, bus: 0, car: 0, other: 0 },
    }

    for (const r of routes) {
      const { mode, distanceKm, savedKg } = await analytics.toAnalyticsRecord(
        r,
        isAdmin
      )

      summary.tripCount += 1
      summary.totalDistanceKm += distanceKm
      summary.totalCo2SavedKg += savedKg

      summary.tripFrequenciesByMode[mode] += 1
      summary.distanceByModeKm[mode] += distanceKm
      summary.co2SavedByModeKg[mode] += savedKg
    }

    summary.totalDistanceKm = analytics.roundToTwoDecimals(
      summary.totalDistanceKm
    )
    summary.totalCo2SavedKg = analytics.roundToTwoDecimals(
      summary.totalCo2SavedKg
    )

    for (const k of Object.keys(summary.distanceByModeKm)) {
      summary.distanceByModeKm[k] = analytics.roundToTwoDecimals(
        summary.distanceByModeKm[k]
      )
      summary.co2SavedByModeKg[k] = analytics.roundToTwoDecimals(
        summary.co2SavedByModeKg[k]
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

    for (const r of routes) {
      const { mode, distanceKm, savedKg } = await analytics.toAnalyticsRecord(
        r,
        isAdmin
      )

      const modeStats = aggregates[mode] || aggregates.other
      modeStats.tripCount += 1
      modeStats.totalDistanceKm += distanceKm
      modeStats.totalCo2SavedKg += savedKg
    }

    const data = ['walk', 'bicycle', 'bus', 'car', 'other'].map(key => {
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

module.exports = app
