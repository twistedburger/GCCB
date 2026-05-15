const { TransportMode } = require('../../../../shared/TransportModes')

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
  walk: TransportMode.WALK.key,
  walking: TransportMode.WALK.key,

  bicycle: TransportMode.BICYCLE.key,
  bike: TransportMode.BICYCLE.key,
  bicycling: TransportMode.BICYCLE.key,
  cycle: TransportMode.BICYCLE.key,

  bus: TransportMode.TRANSIT.key,
  intercity_bus: TransportMode.TRANSIT.key,
  trolleybus: TransportMode.TRANSIT.key,
  share_taxi: TransportMode.TRANSIT.key,
  transit: TransportMode.TRANSIT.key,

  rail: TransportMode.RAIL.key,
  subway: TransportMode.RAIL.key,
  train: TransportMode.RAIL.key,
  light_rail: TransportMode.RAIL.key,
  tram: TransportMode.RAIL.key,
  metro_rail: TransportMode.RAIL.key,
  commuter_train: TransportMode.RAIL.key,
  heavy_rail: TransportMode.RAIL.key,
  high_speed_train: TransportMode.RAIL.key,
  long_distance_train: TransportMode.RAIL.key,
  monorail: TransportMode.RAIL.key,

  drive: TransportMode.CAR.key,
  driving: TransportMode.CAR.key,
  car: TransportMode.CAR.key,
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
 * @returns {string} One of TransportMode values, or TransportMode.OTHER.key as fallback.
 */
function toAnalyticsMode(mode) {
  const normalizedMode = normalizeMode(mode)
  return MODE_MAPPING[normalizedMode] || TransportMode.OTHER.key
}

/**
 * Resolves a transit step's vehicle type into a specific analytics mode.
 * Falls back to TransportMode.TRANSIT.key when the vehicle type is unknown or unmapped.
 *
 * @param {Object} step A route step object from route.path.
 * @returns {string} One of TransportMode values.
 */
function getTransitStepMode(step) {
  const vehicleType = normalizeMode(
    step?.transitDetails?.transitLine?.vehicle?.type
  )

  if (!vehicleType) return TransportMode.TRANSIT.key

  const analyticsMode = toAnalyticsMode(vehicleType)
  return analyticsMode === TransportMode.OTHER.key
    ? TransportMode.TRANSIT.key
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

  if (travelMode === TransportMode.TRANSIT.key) {
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

      if (!rawMode || rawMode === TransportMode.OTHER.key || distanceKm <= 0)
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
