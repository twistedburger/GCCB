const { TransportMode } = require('../constants/TransportModes')

/**
 * Maps raw Google Maps vehicle type strings to analytics mode categories.
 * Keys => raw Google Maps strings
 * Values => Analytic Categories
 *
 * Open for expansion as Google Maps adds new vehicle types.
 *
 * @type {Object.<string, string>}
 */
const MODE_MAPPING = {
  walk: TransportMode.WALK,
  walking: TransportMode.WALK,

  bicycle: TransportMode.BICYCLE,
  bike: TransportMode.BICYCLE,
  bicycling: TransportMode.BICYCLE,
  cycle: TransportMode.BICYCLE,

  bus: TransportMode.TRANSIT,
  intercity_bus: TransportMode.TRANSIT,
  trolleybus: TransportMode.TRANSIT,
  share_taxi: TransportMode.TRANSIT,
  transit: TransportMode.TRANSIT,

  rail: TransportMode.RAIL,
  subway: TransportMode.RAIL,
  train: TransportMode.RAIL,
  light_rail: TransportMode.RAIL,
  tram: TransportMode.RAIL,
  metro_rail: TransportMode.RAIL,
  commuter_train: TransportMode.RAIL,
  heavy_rail: TransportMode.RAIL,
  high_speed_train: TransportMode.RAIL,
  long_distance_train: TransportMode.RAIL,
  monorail: TransportMode.RAIL,

  drive: TransportMode.CAR,
  driving: TransportMode.CAR,
  car: TransportMode.CAR,
}

/**
 * Normalizes a transportation mode string to lowercase with whitespace trimmed.
 *
 * @param {string} mode
 * @returns {string}
 */
function normalizeMode(mode) {
  return String(mode || '')
    .trim()
    .toLowerCase()
}

/**
 * Maps a raw transport mode string to one of the six analytics categories.
 * Used to convert Google Maps vehicle types into dashboard chart categories.
 *
 * @param {string} mode
 * @returns {string} One of TransportMode values, or TransportMode.OTHER as fallback.
 */
function toAnalyticsMode(mode) {
  const normalizedMode = normalizeMode(mode)
  return MODE_MAPPING[normalizedMode] || TransportMode.OTHER
}

/**
 * Resolves a transit step's vehicle type into a specific analytics mode.
 * Falls back to TransportMode.TRANSIT when the vehicle type is unknown or unmapped.
 *
 * @param {Object} step A route step object from route.path.
 * @returns {string} One of TransportMode values.
 */
function getTransitStepMode(step) {
  const vehicleType = normalizeMode(
    step?.transitDetails?.transitLine?.vehicle?.type
  )

  if (!vehicleType) return TransportMode.TRANSIT

  const analyticsMode = toAnalyticsMode(vehicleType)
  return analyticsMode === TransportMode.OTHER
    ? TransportMode.TRANSIT
    : analyticsMode
}

/**
 * Resolves the analytics mode for a route step.
 * Delegates to getTransitStepMode for transit steps to get the specific vehicle type.
 *
 * @param {Object} step A route step object from route.path.
 * @returns {string} One of TransportMode values.
 */
function getStepTransportationMode(step) {
  const travelMode = normalizeMode(step?.travelMode)

  if (travelMode === TransportMode.TRANSIT) {
    return getTransitStepMode(step)
  }

  return toAnalyticsMode(travelMode)
}

/**
 * Rounds a number to two decimal places.
 *
 * @param {number} value
 * @returns {number}
 */
function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100
}

/**
 * Returns the parsed route.path object when present.
 * Handles both pre-parsed objects and raw JSON strings.
 *
 * @param {Object} routeRow Route row from DB.
 * @returns {Object|null}
 */
function getRoutePathObject(routeRow) {
  if (!routeRow?.path) return null
  if (typeof routeRow.path === 'object') return routeRow.path

  try {
    return JSON.parse(routeRow.path)
  } catch {
    return null
  }
}

/**
 * Extracts normalized route segments from Google Maps path data.
 * Filters out steps with unknown modes or zero distance.
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

      if (!rawMode || rawMode === TransportMode.OTHER || distanceKm <= 0)
        continue

      segments.push({ transportationMode: rawMode, distanceKm })
    }
  }

  return segments
}

module.exports = {
  MODE_MAPPING,
  normalizeMode,
  toAnalyticsMode,
  getTransitStepMode,
  getStepTransportationMode,
  roundToTwoDecimals,
  getRoutePathObject,
  extractRouteSegments,
}
