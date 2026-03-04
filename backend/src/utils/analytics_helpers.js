/**
 * Creates helper functions for analytics related to routes and CO2 calculations.
 *
 * @param {Object} params Parameters object.
 * @param {Object} params.db Database object
 * @param {Object} params.co2Calculator Object with method `calculateSaved` for CO2 savings calculations.
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
    bicycle: 'bicycle',
    cycle: 'bicycle', // treating cycle and bicycle as synonymous
    bus: 'bus',
    transit: 'bus', // default transit as 'bus,' but update emissions constants if planning to expand .e.g train
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
        `SELECT r.*
         FROM route r
         WHERE r.completed = true${ordering}`
      )
      return res.rows
    }

    const res = await db.query(
      `SELECT r.*
       FROM route r
       INNER JOIN user_route ur ON ur.route_id = r.id
       WHERE ur.user_id = $1
         AND r.completed = true${ordering}`,
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
   * - Check if router creator is among the participants and include in calculation as passenger.
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
       WHERE route_id = $1`,
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
   * Computes CO2 savings for a given route using the CO2 calculator.
   * If the route is by car, use carpool context to determine:
   * - passengers (derived from user_route + creator inclusion)
   * - vehicleFactor (derived from creator's latest vehicle EV flag)
   *
   * @param {Object} routeRow Route row from DB.
   * @param {string} routeRow.transportation_mode Transportation mode string.
   * @param {number|string} routeRow.distance Route distance in km.
   * @param {number} routeRow.id Route id.
   * @param {number} routeRow.creator_id Route creator user id.
   *
   * @returns {Promise<{ savedKgUser: number, savedKgSystem: number, context: Object }>}
   */
  async function computeRouteSavings(routeRow) {
    const mode = normalizeMode(routeRow.transportation_mode)
    const distanceKm = Number(routeRow.distance) || 0

    let options = {}
    if (mode === 'car') {
      const { passengers, vehicleFactor } = await getCarpoolContext(
        routeRow.id,
        routeRow.creator_id
      )
      options = { passengers, vehicleFactor }
    }

    return co2Calculator.calculateSaved(
      distanceKm,
      routeRow.transportation_mode,
      options
    )
  }

  /**
   * Converts a route row into a normalized analytics record for aggregation.
   *
   * - `mode` is normalized into an analytics categories (walk/bicycle/bus/car/other)
   * - `savedKg` is selected based on role:
   *    - Admin: uses `savedKgSystem` (system-wide savings)
   *    - User: uses `savedKgUser` (each individual user's share)
   *
   * @param {Object} routeRow Route row from DB.
   * @param {boolean} isAdmin True if admin (system scope).
   *
   * @returns {Promise<{
   *   mode: string,
   *   distanceKm: number,
   *   savedKg: number,
   *   savings: { savedKgUser: number, savedKgSystem: number, context: Object }
   * }>}
   */
  async function toAnalyticsRecord(routeRow, isAdmin) {
    const distanceKm = Number(routeRow.distance) || 0
    const rawMode = normalizeMode(routeRow.transportation_mode)
    const mode = MODE_MAPPING[rawMode] || 'other'

    const savings = await computeRouteSavings(routeRow)
    const savedKg = isAdmin ? savings.savedKgSystem : savings.savedKgUser

    return { mode, distanceKm, savedKg, savings }
  }

  return {
    MODE_MAPPING,
    normalizeMode,
    roundToTwoDecimals,
    fetchCompletedRoutes,
    getCarpoolContext,
    computeRouteSavings,
    toAnalyticsRecord,
  }
}

module.exports = { createAnalyticsHelpers }
