const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/RequireAuth')
const { analyticsServices } = require('../src/services/AnalyticsServices')
const { roundToTwoDecimals } = require('../src/utils/AnalyticsUtils')
const { EMISSIONS_G_PER_KM } = require('../src/constants/emissions')
const { selectUser } = require('../src/utils/UserUtils')
const { serverStrings } = require('../locales/en/serverLocales')
const { pool } = require('../db')

/**
 * Returns platform activity KPIs and route status/rejection breakdowns.
 * Admin-only. Rolling time frames: 7 days for creators, 30 days for completion/rejection.
 *
 * @returns {{ kpis, statusBreakdown, rejectionReasons }}
 */
router.get('/activity/summary', requireAuth, async (req, res) => {
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
 * Supports daily, monthly, and quarterly granularity.
 *
 * @returns {{ granularity, data: Array<{ period, baselineKg, actualKg, savedKg }> }}
 */
router.get('/activity/co2-timeseries', requireAuth, async (req, res) => {
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

    const routes = await analyticsServices.fetchCompletedRoutes(user.id, true)

    if (routes.length === 0) {
      return res.status(200).json({ granularity, data: [] })
    }

    // Batch participant counts for all routes
    const routeIds = routes.map(r => r.id)
    const participantRes = await client.query(
      `SELECT
         ur.route_id,
         COUNT(*)::int AS participant_count,
         BOOL_OR(ur.user_id = r.creator_id) AS creator_included
       FROM user_route ur
       JOIN route r ON r.id = ur.route_id
       WHERE ur.route_id = ANY($1)
       GROUP BY ur.route_id`,
      [routeIds]
    )

    const participantMap = {}
    for (const row of participantRes.rows) {
      participantMap[row.route_id] = row.creator_included
        ? row.participant_count
        : row.participant_count + 1
    }

    /**
     * Returns the period key for a given date based on the selected granularity.
     *
     * @param {Date|string} date
     * @returns {string}
     */
    function getPeriodKey(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')

      if (granularity === 'daily') return `${year}-${month}-${day}`
      if (granularity === 'monthly') return `${year}-${month}`
      return `${year}-Q${Math.ceil((d.getMonth() + 1) / 3)}`
    }

    // Batch carpool context for car routes before the loop
    const {
      extractRouteSegments,
      toAnalyticsMode,
    } = require('../src/utils/AnalyticsUtils')
    const { TransportMode } = require('../src/constants/TransportModes')

    const carRoutes = routes.filter(route => {
      const segments = extractRouteSegments(route)
      return segments.length > 0
        ? segments.some(
            s => toAnalyticsMode(s.transportationMode) === TransportMode.CAR
          )
        : toAnalyticsMode(route.transportationMode) === TransportMode.CAR
    })
    const carpoolContextMap =
      await analyticsServices.fetchCarpoolContextsBatch(carRoutes)

    const periodMap = {}

    for (const route of routes) {
      const savings = await analyticsServices.computeRouteSavings(
        route,
        carpoolContextMap
      )
      const participants = participantMap[route.id] ?? 1
      const distanceKm = Number(route.distance) || 0

      const baselineKg = roundToTwoDecimals(
        (participants * distanceKm * EMISSIONS_G_PER_KM.CAR_VEHICLE.PETROL) /
          1000
      )
      const savedKg = savings.savedKgSystem
      const actualKg = roundToTwoDecimals(Math.max(0, baselineKg - savedKg))
      const key = getPeriodKey(route.departTime)

      if (!periodMap[key]) {
        periodMap[key] = { period: key, baselineKg: 0, actualKg: 0, savedKg: 0 }
      }

      periodMap[key].baselineKg = roundToTwoDecimals(
        periodMap[key].baselineKg + baselineKg
      )
      periodMap[key].actualKg = roundToTwoDecimals(
        periodMap[key].actualKg + actualKg
      )
      periodMap[key].savedKg = roundToTwoDecimals(
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

module.exports = router
