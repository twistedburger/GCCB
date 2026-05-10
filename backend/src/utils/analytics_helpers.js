/**
 * Creates helper functions for analytics related to routes and CO2 calculations.
 *
 * @param {Object} params Parameters object.
 * @param {Object} params.db Database object
 * @param {Object} params.co2Calculator Object with co2e calculations based on route segmentation
 * @param {Object} params.emissions Emissions constants.
 * @param {Object} params.emissions.EMISSIONS_G_PER_KM Emissions factors for different vehicle types.
 *
 * @returns {Object} The object containing helper functions for analytics.
 */
function createAnalyticsHelpers({ db, co2Calculator, emissions }) {
  const { EMISSIONS_G_PER_KM } = emissions

  // Open for expansion and chart simplification
  const MODE_MAPPING = {
    walk: 'walk',
    walking: 'walk',

    bicycle: 'bicycle',
    bike: 'bicycle',
    bicycling: 'bicycle',
    cycle: 'bicycle',

    bus: 'transit',
    intercity_bus: 'transit',
    trolleybus: 'transit',
    share_taxi: 'transit',

    rail: 'rail',
    subway: 'rail',
    train: 'rail',
    light_rail: 'rail',
    tram: 'rail',
    metro_rail: 'rail',
    commuter_train: 'rail',
    heavy_rail: 'rail',
    high_speed_train: 'rail',
    long_distance_train: 'rail',
    monorail: 'rail',

    transit: 'transit',

    drive: 'car',
    driving: 'car',
    car: 'car',
  }

  /**
   * Normalizes the transportation mode string to lowercase and trims whitespace.
   *
   * @param {string} mode The transportation mode string.
   * @returns {string} The normalized mode string.
   */
  function normalizeMode(mode) {
    return String(mode || '')
      .trim()
      .toLowerCase()
  }

  /**
   * Maps a transport mode to an analytics category.
   *
   * This is primarily used to convert route details with multiple modes
   * into the smaller set of categories used by the dashboard charts.
   *
   * @param {string} mode The transportation mode.
   * @returns {string} Analytics mode category (walk/bicycle/bus/rail/car/other).
   */
  function toAnalyticsMode(mode) {
    const normalizedMode = normalizeMode(mode)
    return MODE_MAPPING[normalizedMode] || 'other'
  }

  /**
   * Helper function to resolves a transit step into a more specific mode.
   * Maps those vehicle types into the dashboard's analytics categories.
   *
   * @param {Object} step A route step object from `route.path`.
   * @returns {string} Normalized transportation mode.
   */
  function getTransitStepMode(step) {
    const vehicleType = normalizeMode(
      step?.transitDetails?.transitLine?.vehicle?.type
    )

    if (!vehicleType) {
      return 'transit'
    }

    const analyticsMode = toAnalyticsMode(vehicleType)
    return analyticsMode === 'other' ? 'transit' : analyticsMode
  }

  /**
   * Resolves the transportation mode for a route step.
   *
   * @param {Object} step A route step object from `route.path`.
   * @returns {string} Normalized transportation mode.
   */
  function getStepTransportationMode(step) {
    const travelMode = normalizeMode(step?.travelMode)

    if (travelMode === 'transit') {
      return getTransitStepMode(step)
    }

    return toAnalyticsMode(travelMode)
  }

  /**
   * Rounds a number to two decimal places.
   *
   * @param {number} value The number to round.
   * @returns {number} The rounded number.
   */
  function roundToTwoDecimals(value) {
    return Math.round(value * 100) / 100
  }

  /**
   * Retrieves completed routes scoped by user role:
   * - Admin: all completed routes
   * - User: completed routes the user participated in (via user_route)
   *
   * @param {number} userId Authenticated user's DB id.
   * @param {boolean} isAdmin True for admin users; otherwise false.
   * @param {Object} [options]
   * @param {boolean} [options.orderByDepartTime=false] If true, orders by descending `depart_time`.
   *
   * @returns {Promise<Object[]>} Array of route rows.
   */
  async function fetchCompletedRoutes(userId, isAdmin, options = {}) {
    const { orderByDepartTime = false } = options
    const ordering = orderByDepartTime ? ' ORDER BY r.depart_time DESC' : ''

    if (isAdmin) {
      const res = await db.query(
        `SELECT
           r.id,
           r.title,
           r.transportation_mode AS "transportationMode",
           r.creator_id AS "creatorId",
           r.origin,
           r.destination,
           r.distance,
           r.depart_time AS "departTime",
           r.max_ppl AS "maxPpl",
           r.completed,
           r.description,
           r.rejection_reason AS "rejectionReason",
           r.path,
           r.created_at AS "createdAt"
         FROM route r
         WHERE EXISTS (
           SELECT 1 FROM user_route ur
           WHERE ur.route_id = r.id
             AND ur.completed = true
         )${ordering}`
      )
      return res.rows
    }

    const res = await db.query(
      `SELECT
         r.id,
         r.title,
         r.transportation_mode AS "transportationMode",
         r.creator_id AS "creatorId",
         r.origin,
         r.destination,
         r.distance,
         r.depart_time AS "departTime",
         r.max_ppl AS "maxPpl",
         r.completed,
         r.description,
         r.rejection_reason AS "rejectionReason",
         r.path,
         r.created_at AS "createdAt"
       FROM route r
       INNER JOIN user_route ur ON ur.route_id = r.id
       WHERE ur.user_id = $1
         AND ur.completed = true${ordering}`,
      [userId]
    )
    return res.rows
  }

  /**
   * Builds the carpool context used for CO2 calculations:
   * - passengers: total people in the carpool (driver + passengers)
   * - vehicleFactor: emissions factor for the creator's latest vehicle (EV vs standard/petrol)
   *
   * Passenger logic:
   * - Query returns `participant_count` (num rows in `user_route`).
   * - Check if route creator is among the participants and include in calculation as passenger.
   * - If for whatever reason the route creator is not a participant i.e. the driver is outside of the system,
   *   we include as a passenger for co2e savings calculations.
   *
   * Vehicle logic:
   * - Assume that the most recent vehicle used is the one used
   *   for the carpool and fetch (ORDER BY id DESC LIMIT 1).
   * - If `e_v` is true, use electric vehicle factor; otherwise standard/petrol.
   * - If no vehicle exists, it defaults to petrol factor.
   *
   * @param {number} routeId Route id.
   * @param {number} creatorId Route creator user id.
   *
   * @returns {Promise<{ passengers: number, vehicleFactor: number }>}
   */
  async function getCarpoolContext(routeId, creatorId) {
    const passengerRes = await db.query(
      `SELECT
         COUNT(*)::int AS participant_count,
         BOOL_OR(user_id = $2) AS creator_included
       FROM user_route
       WHERE route_id = $1
         AND completed = true`,
      [routeId, creatorId]
    )

    const participantCount = passengerRes.rows[0]?.participant_count ?? 0
    const creatorIncluded = passengerRes.rows[0]?.creator_included === true
    const passengers = creatorIncluded ? participantCount : participantCount + 1

    const vehicleRes = await db.query(
      `SELECT e_v
       FROM vehicle
       WHERE driver_id = $1
       ORDER BY id DESC
       LIMIT 1`,
      [creatorId]
    )

    const isEv = vehicleRes.rowCount !== 0 && vehicleRes.rows[0].e_v === true
    const vehicleFactor = isEv
      ? EMISSIONS_G_PER_KM.CAR_VEHICLE.ELECTRIC
      : EMISSIONS_G_PER_KM.CAR_VEHICLE.PETROL

    return { passengers, vehicleFactor }
  }

  /**
   * Returns the parsed `route.path` object when present.
   *
   * @param {Object} routeRow Route row from DB.
   * @returns {Object|null} Parsed path object or null when unavailable/invalid.
   */
  function getRoutePathObject(routeRow) {
    if (!routeRow?.path) return null

    if (typeof routeRow.path === 'object') {
      return routeRow.path
    }

    try {
      return JSON.parse(routeRow.path)
    } catch {
      return null
    }
  }

  /**
   * Extracts normalized route segments from detailed route path data.
   *
   * @param {Object} routeRow Route row from DB.
   * @returns {Array<{ transportationMode: string, distanceKm: number }>}
   */
  function extractRouteSegments(routeRow) {
    const pathObject = getRoutePathObject(routeRow)
    const legs = Array.isArray(pathObject?.legs) ? pathObject.legs : []

    const segments = []

    for (const leg of legs) {
      const steps = Array.isArray(leg?.steps) ? leg.steps : []

      for (const step of steps) {
        const rawMode = getStepTransportationMode(step)
        const distanceKm = Number(step?.distanceMeters || 0) / 1000

        if (!rawMode || rawMode === 'other' || distanceKm <= 0) {
          continue
        }

        segments.push({
          transportationMode: rawMode,
          distanceKm,
        })
      }
    }

    return segments
  }

  /**
   * Computes CO2 savings for a given route using the CO2 calculator.
   *
   * If any car segment exists, use carpool context to determine:
   * - passengers (derived from user_route + creator inclusion)
   * - vehicleFactor (derived from the creator's vehicle EV boolean flag)
   *
   * @param {Object} routeRow Route row from DB.
   * @param {string} routeRow.transportationMode Transportation mode string.
   * @param {number|string} routeRow.distance Route distance in km.
   * @param {number} routeRow.id Route id.
   * @param {number} routeRow.creatorId Route creator user id.
   * @param {Object|string} [routeRow.path] Optional route details JSON/object.
   *
   * @returns {Promise<{ savedKgUser: number, savedKgSystem: number, context: Object }>}
   */
  async function computeRouteSavings(routeRow) {
    const segments = extractRouteSegments(routeRow)

    if (segments.length > 0) {
      let carpoolOptions = {}

      const hasCarSegment = segments.some(
        segment => toAnalyticsMode(segment.transportationMode) === 'car'
      )

      if (hasCarSegment) {
        const { passengers, vehicleFactor } = await getCarpoolContext(
          routeRow.id,
          routeRow.creatorId
        )
        carpoolOptions = { passengers, vehicleFactor }
      }

      return co2Calculator.calculateSavedFromSegments(segments, segment => {
        const analyticsMode = toAnalyticsMode(segment.transportationMode)
        return analyticsMode === 'car' ? carpoolOptions : {}
      })
    }

    const mode = normalizeMode(routeRow.transportationMode)
    const distanceKm = Number(routeRow.distance) || 0

    let options = {}
    if (toAnalyticsMode(mode) === 'car') {
      const { passengers, vehicleFactor } = await getCarpoolContext(
        routeRow.id,
        routeRow.creatorId
      )
      options = { passengers, vehicleFactor }
    }

    return co2Calculator.calculateSaved(
      distanceKm,
      toAnalyticsMode(routeRow.transportationMode),
      options
    )
  }

  /**
   * Converts a route row into one or more analytics contributions for aggregation.
   *
   * @param {Object} routeRow Route row from DB.
   * @param {boolean} isAdmin True if admin (system scope).
   *
   * @returns {Promise<Array<{
   *   mode: string,
   *   distanceKm: number,
   *   savedKg: number,
   *   tripCount: number
   * }>>}
   */
  async function toAnalyticsContributions(routeRow, isAdmin) {
    const segments = extractRouteSegments(routeRow)

    if (segments.length > 0) {
      let carpoolOptions = {}

      const hasCarSegment = segments.some(
        segment => toAnalyticsMode(segment.transportationMode) === 'car'
      )

      if (hasCarSegment) {
        const { passengers, vehicleFactor } = await getCarpoolContext(
          routeRow.id,
          routeRow.creatorId
        )
        carpoolOptions = { passengers, vehicleFactor }
      }

      const contributions = segments.map(segment => {
        const mode = toAnalyticsMode(segment.transportationMode)
        const distanceKm = segment.distanceKm

        const savings = co2Calculator.calculateSaved(
          distanceKm,
          mode,
          mode === 'car' ? carpoolOptions : {}
        )

        return {
          mode,
          distanceKm,
          savedKg: isAdmin ? savings.savedKgSystem : savings.savedKgUser,
          tripCount: 0,
        }
      })

      const totalsByMode = {}
      for (const contribution of contributions) {
        totalsByMode[contribution.mode] =
          (totalsByMode[contribution.mode] || 0) + contribution.distanceKm
      }

      let dominantMode = 'other'
      let maxDistance = -1

      for (const [mode, totalDistance] of Object.entries(totalsByMode)) {
        if (totalDistance > maxDistance) {
          dominantMode = mode
          maxDistance = totalDistance
        }
      }

      const dominantContribution = contributions.find(
        contribution => contribution.mode === dominantMode
      )

      if (dominantContribution) {
        dominantContribution.tripCount = 1
      }

      return contributions
    }

    const distanceKm = Number(routeRow.distance) || 0
    const mode = toAnalyticsMode(routeRow.transportationMode)
    const savings = await computeRouteSavings(routeRow)

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
   * Builds an analytics summary object for a given user.
   * Used by the analytics summary route and badge evaluation hooks.
   *
   * @param {number}  userId
   * @param {boolean} isAdmin
   * @returns {Promise<Object>} Analytics summary object.
   */
  async function buildAnalyticsSummary(userId, isAdmin) {
    const routes = await fetchCompletedRoutes(userId, isAdmin)

    const summary = {
      scope: isAdmin ? 'system' : 'user',
      userId,
      tripCount: 0,
      totalDistanceKm: 0,
      totalCo2SavedKg: 0,
      tripFrequenciesByMode: {
        walk: 0,
        bicycle: 0,
        transit: 0,
        rail: 0,
        car: 0,
        other: 0,
      },
      distanceByModeKm: {
        walk: 0,
        bicycle: 0,
        transit: 0,
        rail: 0,
        car: 0,
        other: 0,
      },
      co2SavedByModeKg: {
        walk: 0,
        bicycle: 0,
        transit: 0,
        rail: 0,
        car: 0,
        other: 0,
      },
    }

    for (const route of routes) {
      const contributions = await toAnalyticsContributions(route, isAdmin)
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

  return {
    MODE_MAPPING,
    normalizeMode,
    toAnalyticsMode,
    getTransitStepMode,
    getStepTransportationMode,
    roundToTwoDecimals,
    fetchCompletedRoutes,
    getCarpoolContext,
    getRoutePathObject,
    extractRouteSegments,
    computeRouteSavings,
    toAnalyticsContributions,
    buildAnalyticsSummary,
  }
}

module.exports = { createAnalyticsHelpers }
