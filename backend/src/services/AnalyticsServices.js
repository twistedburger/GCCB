const { TransportMode } = require('../../../shared/TransportModes')
const { EMISSIONS_G_PER_KM } = require('../constants/Emissions')
const {
  toAnalyticsMode,
  normalizeMode,
  extractRouteSegments,
  roundToTwoDecimals,
} = require('../utils/AnalyticsUtils')

/**
 * Encapsulates all analytics DB queries and CO₂ orchestration.
 */
class AnalyticsServices {
  /** @type {import('pg').Pool} */
  #db

  /** @type {Object} */
  #co2Calculator

  /**
   * @param {Object} params
   * @param {import('pg').Pool} params.db
   * @param {Object}            params.co2Calculator
   */
  constructor({ db, co2Calculator }) {
    this.#db = db
    this.#co2Calculator = co2Calculator
  }

  /**
   * Retrieves completed routes scoped by user role:
   * - Admin: all routes where at least one participant has completed (via user_route)
   * - User: routes the user personally marked as completed
   *
   * @param {number}  userId
   * @param {boolean} isAdmin
   * @param {Object}  [options]
   * @param {boolean} [options.orderByDepartTime=false] Orders by depart_time DESC when true.
   * @returns {Promise<Object[]>}
   */
  async fetchCompletedRoutes(userId, isAdmin, options = {}) {
    const { orderByDepartTime = false } = options
    const ordering = orderByDepartTime ? ' ORDER BY r.depart_time DESC' : ''

    if (isAdmin) {
      const res = await this.#db.query(
        `SELECT
           r.id,
           r.title,
           r.transportation_mode AS "transportationMode",
           r.creator_id          AS "creatorId",
           r.origin,
           r.destination,
           r.distance,
           r.depart_time         AS "departTime",
           r.max_ppl             AS "maxPpl",
           r.completed,
           r.description,
           r.rejection_reason    AS "rejectionReason",
           r.path,
           r.is_ev               AS "isEv",
           r.created_at          AS "createdAt"
         FROM route r
         WHERE EXISTS (
           SELECT 1 FROM user_route ur
           WHERE ur.route_id = r.id
             AND ur.completed = true
         )${ordering}`
      )
      return res.rows
    }

    const res = await this.#db.query(
      `SELECT
         r.id,
         r.title,
         r.transportation_mode AS "transportationMode",
         r.creator_id          AS "creatorId",
         r.origin,
         r.destination,
         r.distance,
         r.depart_time         AS "departTime",
         r.max_ppl             AS "maxPpl",
         r.completed,
         r.description,
         r.rejection_reason    AS "rejectionReason",
         r.path,
         r.is_ev               AS "isEv",
         r.created_at          AS "createdAt"
       FROM route r
       INNER JOIN user_route ur ON ur.route_id = r.id
       WHERE ur.user_id  = $1
         AND ur.completed = true${ordering}`,
      [userId]
    )
    return res.rows
  }

  /**
   * Fetches carpool context for a single route.
   * Used when computing CO₂ savings for a standalone route (e.g. commute-history).
   *
   * Passenger logic:
   * - Counts completed user_route rows as participants.
   * - If the creator is not among participants, they are still counted as the driver.
   *
   * Vehicle logic:
   * - Uses the creator's most recently registered vehicle.
   * - Defaults to petrol factor if no vehicle is registered.
   *
   * @param {number} routeId
   * @param {number} creatorId
   * @returns {Promise<{ passengers: number, vehicleFactor: number }>}
   */
  async getCarpoolContext(routeId, creatorId, isEv = false) {
    const passengerRes = await this.#db.query(
      `SELECT
         COUNT(*)::int AS participant_count,
         BOOL_OR(user_id = $2) AS creator_included
       FROM user_route
       WHERE route_id  = $1
         AND completed = true`,
      [routeId, creatorId]
    )

    const participantCount = passengerRes.rows[0]?.participant_count ?? 0
    const creatorIncluded = passengerRes.rows[0]?.creator_included === true
    const passengers = creatorIncluded ? participantCount : participantCount + 1
    const vehicleFactor = isEv
      ? EMISSIONS_G_PER_KM.CAR_VEHICLE.ELECTRIC
      : EMISSIONS_G_PER_KM.CAR_VEHICLE.PETROL

    return { passengers, vehicleFactor }
  }

  /**
   * Batch-fetches carpool context for multiple car routes in two queries.
   *
   * @param {Object[]} carRoutes Route rows that contain at least one car segment.
   * @returns {Promise<Map<number, { passengers: number, vehicleFactor: number }>>}
   *   Map keyed by route id.
   */
  async fetchCarpoolContextsBatch(carRoutes) {
    if (carRoutes.length === 0) return new Map()

    const routeIds = carRoutes.map(route => route.id)

    const passengerRes = await this.#db.query(
      `SELECT
         ur.route_id,
         COUNT(*)::int AS participant_count,
         BOOL_OR(ur.user_id = r.creator_id) AS creator_included
       FROM user_route ur
       JOIN route r ON r.id = ur.route_id
       WHERE ur.route_id  = ANY($1)
         AND ur.completed = true
       GROUP BY ur.route_id`,
      [routeIds]
    )

    const isEvMap = new Map(
      carRoutes.map(route => [route.id, route.isEv ?? false])
    )

    // Context map keyed by route id
    const contextMap = new Map()
    for (const row of passengerRes.rows) {
      const passengers = row.creator_included
        ? row.participant_count
        : row.participant_count + 1
      const vehicleFactor = isEvMap.get(row.route_id)
        ? EMISSIONS_G_PER_KM.CAR_VEHICLE.ELECTRIC
        : EMISSIONS_G_PER_KM.CAR_VEHICLE.PETROL

      contextMap.set(row.route_id, { passengers, vehicleFactor })
    }

    return contextMap
  }

  /**
   * Computes CO₂ savings for a single route.
   * Accepts an optional carpoolContextMap for batch usage if not provided,
   * falls back to getCarpoolContext for standalone calls (e.g. commute-history).
   *
   * @param {Object}           routeRow
   * @param {Map|null}         [carpoolContextMap]
   * @returns {Promise<{ savedKgUser: number, savedKgSystem: number, context: Object }>}
   */
  async computeRouteSavings(routeRow, carpoolContextMap = null) {
    const segments = extractRouteSegments(routeRow)

    if (segments.length > 0) {
      let carpoolOptions = {}

      const hasCarSegment = segments.some(
        segment =>
          toAnalyticsMode(segment.transportationMode) === TransportMode.CAR.key
      )

      if (hasCarSegment) {
        const context =
          carpoolContextMap?.get(routeRow.id) ??
          (await this.getCarpoolContext(
            routeRow.id,
            routeRow.creatorId,
            routeRow.isEv
          ))
        carpoolOptions = context
      }

      return this.#co2Calculator.calculateSavedFromSegments(
        segments,
        segment => {
          const analyticsMode = toAnalyticsMode(segment.transportationMode)
          return analyticsMode === TransportMode.CAR.key ? carpoolOptions : {}
        }
      )
    }

    const mode = normalizeMode(routeRow.transportationMode)
    const distanceKm = Number(routeRow.distance) || 0
    let options = {}

    if (toAnalyticsMode(mode) === TransportMode.CAR.key) {
      const context =
        carpoolContextMap?.get(routeRow.id) ??
        (await this.getCarpoolContext(
          routeRow.id,
          routeRow.creatorId,
          routeRow.isEv
        ))
      options = context
    }

    return this.#co2Calculator.calculateSaved(
      distanceKm,
      toAnalyticsMode(routeRow.transportationMode),
      options
    )
  }

  /**
   * Converts a route row into one or more analytics contribution records.
   * For multi-segment routes, each segment contributes its own mode/distance/CO₂.
   * The dominant mode (by distance) receives tripCount: 1; others get 0.
   *
   * Accepts an optional carpoolContextMap for batch usage.
   *
   * @param {Object}   routeRow
   * @param {boolean}  isAdmin
   * @param {Map|null} [carpoolContextMap]
   * @returns {Promise<Array<{ mode: string, distanceKm: number, savedKg: number, tripCount: number }>>}
   */
  async toAnalyticsContributions(routeRow, isAdmin, carpoolContextMap = null) {
    const segments = extractRouteSegments(routeRow)

    if (segments.length > 0) {
      let carpoolOptions = {}

      const hasCarSegment = segments.some(
        segment =>
          toAnalyticsMode(segment.transportationMode) === TransportMode.CAR.key
      )

      if (hasCarSegment) {
        const context =
          carpoolContextMap?.get(routeRow.id) ??
          (await this.getCarpoolContext(
            routeRow.id,
            routeRow.creatorId,
            routeRow.isEv
          ))
        carpoolOptions = context
      }

      const contributions = segments.map(segment => {
        const mode = toAnalyticsMode(segment.transportationMode)
        const distanceKm = segment.distanceKm
        const savings = this.#co2Calculator.calculateSaved(
          distanceKm,
          mode,
          mode === TransportMode.CAR.key ? carpoolOptions : {}
        )

        return {
          mode,
          distanceKm,
          savedKg: isAdmin ? savings.savedKgSystem : savings.savedKgUser,
          tripCount: 0,
        }
      })

      // Assign tripCount: 1 to the segment with the most distance
      const totalsByMode = {}
      for (const c of contributions) {
        totalsByMode[c.mode] = (totalsByMode[c.mode] || 0) + c.distanceKm
      }

      let dominantMode = TransportMode.OTHER.key
      let maxDistance = -1
      for (const [mode, totalDistance] of Object.entries(totalsByMode)) {
        if (totalDistance > maxDistance) {
          dominantMode = mode
          maxDistance = totalDistance
        }
      }

      const dominantContribution = contributions.find(
        c => c.mode === dominantMode
      )
      if (dominantContribution) dominantContribution.tripCount = 1

      return contributions
    }

    const distanceKm = Number(routeRow.distance) || 0
    const mode = toAnalyticsMode(routeRow.transportationMode)
    const savings = await this.computeRouteSavings(routeRow, carpoolContextMap)

    return [
      {
        mode,
        distanceKm,
        savedKg: isAdmin ? savings.savedKgSystem : savings.savedKgUser,
        tripCount: 1,
      },
    ]
  }

  /**
   * Builds a full analytics summary for a user.
   * Batch-fetches carpool context upfront to avoid N+1 queries.
   *
   * @param {number}  userId
   * @param {boolean} isAdmin
   * @returns {Promise<Object>} Analytics summary object.
   */
  async buildAnalyticsSummary(userId, isAdmin) {
    const routes = await this.fetchCompletedRoutes(userId, isAdmin)

    const carRoutes = routes.filter(route => {
      const segments = extractRouteSegments(route)
      return segments.length > 0
        ? segments.some(
            segment =>
              toAnalyticsMode(segment.transportationMode) ===
              TransportMode.CAR.key
          )
        : toAnalyticsMode(route.transportationMode) === TransportMode.CAR.key
    })

    const carpoolContextMap = await this.fetchCarpoolContextsBatch(carRoutes)

    const summary = {
      scope: isAdmin ? 'system' : 'user',
      userId,
      tripCount: 0,
      totalDistanceKm: 0,
      totalCo2SavedKg: 0,
      tripFrequenciesByMode: Object.fromEntries(
        Object.values(TransportMode).map(mode => [mode.key, 0])
      ),
      distanceByModeKm: Object.fromEntries(
        Object.values(TransportMode).map(mode => [mode.key, 0])
      ),
      co2SavedByModeKg: Object.fromEntries(
        Object.values(TransportMode).map(mode => [mode.key, 0])
      ),
    }

    for (const route of routes) {
      const contributions = await this.toAnalyticsContributions(
        route,
        isAdmin,
        carpoolContextMap
      )
      summary.tripCount += 1

      for (const item of contributions) {
        const mode =
          item.mode in summary.tripFrequenciesByMode
            ? item.mode
            : TransportMode.OTHER.key
        summary.totalDistanceKm += item.distanceKm
        summary.totalCo2SavedKg += item.savedKg
        summary.tripFrequenciesByMode[mode] += item.tripCount
        summary.distanceByModeKm[mode] += item.distanceKm
        summary.co2SavedByModeKg[mode] += item.savedKg
      }
    }

    summary.totalDistanceKm = roundToTwoDecimals(summary.totalDistanceKm)
    summary.totalCo2SavedKg = roundToTwoDecimals(summary.totalCo2SavedKg)
    for (const key of Object.keys(summary.distanceByModeKm)) {
      summary.distanceByModeKm[key] = roundToTwoDecimals(
        summary.distanceByModeKm[key]
      )
      summary.co2SavedByModeKg[key] = roundToTwoDecimals(
        summary.co2SavedByModeKg[key]
      )
    }

    return summary
  }
}

const db = require('../../db')
const { defaultCo2Calculator } = require('../utils/Co2Calculator')

const analyticsServices = new AnalyticsServices({
  db,
  co2Calculator: defaultCo2Calculator,
})

module.exports = { AnalyticsServices, analyticsServices }
