const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/RequireAuth')
const { analyticsServices } = require('../src/services/AnalyticsServices')
const { roundToTwoDecimals } = require('../src/utils/AnalyticsUtils')
const { TransportMode } = require('../src/constants/TransportModes')
const { selectUser } = require('../src/utils/UserUtils')
const { serverStrings } = require('../locales/en/serverLocales')

/**
 * Returns the commute history for the authenticated user.
 * For users only; admin and moderator roles are denied.
 *
 * @returns {{ scope, userId, count, routes }}
 */
router.get('/commute-history', requireAuth, async (req, res) => {
  try {
    const user = await selectUser(req)
    if (!user) return res.status(404).send(serverStrings.errors.noUser)

    if (user.role !== 'user') {
      return res
        .status(403)
        .json({ error: serverStrings.errors.analyticsUserOnly })
    }

    const routes = await analyticsServices.fetchCompletedRoutes(
      user.id,
      false,
      {
        orderByDepartTime: true,
      }
    )

    const commuteHistory = []

    for (const route of routes) {
      const savings = await analyticsServices.computeRouteSavings(route)
      const contributions = await analyticsServices.toAnalyticsContributions(
        route,
        false
      )

      const totalDistanceKm = contributions.reduce(
        (sum, c) => sum + c.distanceKm,
        0
      )

      // Dominant mode by distance
      const totalsByMode = {}
      for (const c of contributions) {
        totalsByMode[c.mode] = (totalsByMode[c.mode] || 0) + c.distanceKm
      }

      let dominantMode = TransportMode.OTHER
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
        distance: roundToTwoDecimals(totalDistanceKm),
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
 * Returns a summary of trips, distances, and CO₂ savings.
 * Admins receive system-wide data; users receive personal data.
 *
 * @returns {Object} Analytics summary object from buildAnalyticsSummary.
 */
router.get('/analytics/summary', requireAuth, async (req, res) => {
  try {
    const user = await selectUser(req)
    if (!user) return res.status(404).send(serverStrings.errors.noUser)

    const isAdmin = user.role === 'admin'
    const summary = await analyticsServices.buildAnalyticsSummary(
      user.id,
      isAdmin
    )

    return res.status(200).json(summary)
  } catch (error) {
    console.error('Error in /api/analytics/summary:', error)
    return res.status(500).send(serverStrings.errors.generic)
  }
})

/**
 * Returns analytics grouped by transportation mode.
 * Admins receive system-wide data; users receive personal data.
 * A single completed route contributes to multiple modes when segment data exists.
 * Trip count is assigned to the dominant mode only.
 *
 * @returns {{ scope, userId, data: Array<{ mode, tripCount, totalDistanceKm, totalCo2SavedKg }> }}
 */
router.get('/analytics/by-mode', requireAuth, async (req, res) => {
  try {
    const user = await selectUser(req)
    if (!user) return res.status(404).send(serverStrings.errors.noUser)

    const isAdmin = user.role === 'admin'
    const routes = await analyticsServices.fetchCompletedRoutes(
      user.id,
      isAdmin
    )

    const carRoutes = routes.filter(route => {
      const {
        extractRouteSegments,
        toAnalyticsMode,
      } = require('../src/utils/AnalyticsUtils')
      const segments = extractRouteSegments(route)
      return segments.length > 0
        ? segments.some(
            s => toAnalyticsMode(s.transportationMode) === TransportMode.CAR
          )
        : toAnalyticsMode(route.transportationMode) === TransportMode.CAR
    })
    const carpoolContextMap =
      await analyticsServices.fetchCarpoolContextsBatch(carRoutes)

    const aggregates = Object.fromEntries(
      Object.values(TransportMode).map(m => [
        m,
        {
          mode: m,
          tripCount: 0,
          totalDistanceKm: 0,
          totalCo2SavedKg: 0,
        },
      ])
    )

    for (const route of routes) {
      const contributions = await analyticsServices.toAnalyticsContributions(
        route,
        isAdmin,
        carpoolContextMap
      )
      for (const item of contributions) {
        const modeStats =
          aggregates[item.mode] ?? aggregates[TransportMode.OTHER]
        modeStats.tripCount += item.tripCount
        modeStats.totalDistanceKm += item.distanceKm
        modeStats.totalCo2SavedKg += item.savedKg
      }
    }

    const data = Object.values(TransportMode).map(key => {
      const item = aggregates[key]
      return {
        mode: item.mode,
        tripCount: item.tripCount,
        totalDistanceKm: roundToTwoDecimals(item.totalDistanceKm),
        totalCo2SavedKg: roundToTwoDecimals(item.totalCo2SavedKg),
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

module.exports = router
