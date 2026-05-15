const { EMISSIONS_G_PER_KM } = require('../constants/emissions')

const GRAMS_PER_KG = 1000
const DEFAULT_PASSENGERS = 2

/**
 * Computes estimated CO2e (CO2 equivalent) savings, in kilograms, for a completed route
 * compared against a baseline "solo petrol car."
 *
 * Car emission factors:     g CO2e / vehicle-km
 * Transit emission factors: g CO2e / passenger-km
 * Output:                   kg CO2e
 *
 * Baseline reference:
 * One person driving solo in a standard petrol car.
 *
 * Default carpool set to two passengers.
 * All savings are estimates and calculated relative to this baseline.
 */
class Co2Calculator {
  constructor({
    // Baseline solo petrol car (g / vehicle-km)
    baselineCarFactor = EMISSIONS_G_PER_KM.CAR_VEHICLE.PETROL,

    // Bus emissions (g / passenger-km)
    busFactor = EMISSIONS_G_PER_KM.TRANSIT_PASSENGER.BUS,

    // Rail emissions (g / passenger-km)
    railFactor = EMISSIONS_G_PER_KM.TRANSIT_PASSENGER.RAIL,

    // Default total people in a carpool
    defaultPassengers = DEFAULT_PASSENGERS,
  } = {}) {
    this.baselineCarFactor = this._validateNumber(
      baselineCarFactor,
      'baselineCarFactor'
    )
    this.busFactor = this._validateNumber(busFactor, 'busFactor')
    this.railFactor = this._validateNumber(railFactor, 'railFactor')
    this.defaultPassengers = this._validatePositiveInteger(
      defaultPassengers,
      'defaultPassengers'
    )
  }

  /**
   * Validates a non-negative numeric parameter.
   *
   * @param {number} value Value to validate.
   * @param {string} paramName For error logging
   *
   * @returns {number} The validated number.
   */
  _validateNumber(value, paramName) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new TypeError(`${paramName} must be a number`)
    }
    if (value < 0) {
      throw new RangeError(`${paramName} must be >= 0`)
    }
    return value
  }

  /**
   * Validates a positive integer parameter.
   *
   * @param {number} value Value to validate.
   * @param {string} paramName For error logging
   *
   * @returns {number} The validated integer.
   */
  _validatePositiveInteger(value, paramName) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new TypeError(`${paramName} must be a positive integer`)
    }
    return value
  }

  /**
   * Normalizes a transportation mode string.
   *
   * @param {string} mode Raw transportation mode.
   * @returns {string} Lowercased and trimmed mode string.
   */
  _normalizeMode(mode) {
    return String(mode || '')
      .trim()
      .toLowerCase()
  }

  /**
   * Returns a passenger count to use for carpool calculations.
   *
   * @param {number} passengers Total number of people in the shared vehicle.
   * @returns {number} Passenger count used for calculations.
   */
  _getPassengerCount(passengers) {
    return Number.isInteger(passengers) && passengers > 0
      ? passengers
      : this.defaultPassengers
  }

  /**
   * Rounds a kilogram value to two decimal places.
   *
   * @param {number} value Value in kg.
   * @returns {number} Rounded value.
   */
  _roundKg(value) {
    return Math.round(value * 100) / 100
  }

  /**
   * Validates and normalizes a route segment used in segment-based calculations.
   *
   * @param {Object} segment Segment object.
   * @param {number} index Segment index
   *
   * @returns {{ transportationMode: string, distanceKm: number }}
   */
  _validateSegment(segment, index) {
    if (!segment || typeof segment !== 'object') {
      throw new TypeError(`segment at index ${index} must be an object`)
    }

    const distanceKm = Number(segment.distanceKm)
    this._validateNumber(distanceKm, `segments[${index}].distanceKm`)

    const transportationMode = this._normalizeMode(segment.transportationMode)
    if (!transportationMode) {
      throw new RangeError(`segments[${index}].transportationMode is required`)
    }

    return {
      transportationMode: transportationMode,
      distanceKm,
    }
  }

  /**
   * Calculates CO2e savings for a route based on transportation mode and options.
   *
   * @param {number} distanceKm
   * @param {string} transportationMode
   * @param {Object} [options]
   * @param {number} [options.passengers]
   * @param {number} [options.vehicleFactor] g CO2e / vehicle-km (carpool only)
   *
   * @returns {{
   *   savedKgUser: number,
   *   savedKgSystem: number,
   *   context: {
   *     transitMode?: string,
   *     passengers?: number,
   *     vehicleFactor?: number
   *   }
   * }}
   */
  calculateSaved(distanceKm, transportationMode, options = {}) {
    this._validateNumber(distanceKm, 'distanceKm')

    const mode = this._normalizeMode(transportationMode)
    if (!mode) {
      throw new RangeError('Transportation mode is required')
    }

    const result = {
      savedKgUser: 0,
      savedKgSystem: 0,
      context: {},
    }

    if (distanceKm === 0) return result

    // Handler for modes like walk, bicycle
    const activeModeHandler = () => {
      const savedKg = (distanceKm * this.baselineCarFactor) / GRAMS_PER_KG

      const rounded = this._roundKg(savedKg)

      result.savedKgUser = rounded
      result.savedKgSystem = rounded
    }

    // Handler for bus transit
    const busHandler = () => {
      const savedKg = Math.max(
        0,
        (distanceKm * (this.baselineCarFactor - this.busFactor)) / GRAMS_PER_KG
      )

      const rounded = this._roundKg(savedKg)

      result.savedKgUser = rounded
      result.savedKgSystem = rounded
      result.context = { transitMode: 'bus' }
    }

    // Handler for rail transit
    const railHandler = () => {
      const savedKg = Math.max(
        0,
        (distanceKm * (this.baselineCarFactor - this.railFactor)) / GRAMS_PER_KG
      )

      const rounded = this._roundKg(savedKg)

      result.savedKgUser = rounded
      result.savedKgSystem = rounded
      result.context = { transitMode: 'rail' }
    }

    // Handler for carpool
    const carHandler = () => {
      const passengers = this._getPassengerCount(options.passengers)

      const vehicleFactor =
        options.vehicleFactor == null
          ? EMISSIONS_G_PER_KM.CAR_VEHICLE.PETROL
          : this._validateNumber(options.vehicleFactor, 'vehicleFactor')

      // System savings per km:
      // passengers * baseline - actual shared vehicle emissions (standard vs ev)
      const savedSystemKg = Math.max(
        0,
        (distanceKm * (passengers * this.baselineCarFactor - vehicleFactor)) /
          GRAMS_PER_KG
      )

      const savedUserKg = savedSystemKg / passengers

      result.savedKgSystem = this._roundKg(savedSystemKg)
      result.savedKgUser = this._roundKg(savedUserKg)
      result.context = { passengers, vehicleFactor }
    }

    const handlers = {
      walk: activeModeHandler,
      bicycle: activeModeHandler,
      bus: busHandler,
      transit: busHandler,
      rail: railHandler,
      car: carHandler,
    }

    const handler = handlers[mode]

    if (!handler) {
      throw new RangeError(
        `Unsupported transportation mode: ${transportationMode}`
      )
    }

    handler()
    return result
  }

  /**
   * Calculates total CO2e savings by summing savings across multiple route segments.
   *
   * @param {Array<Object>} segments Array of normalized route segments.
   * @param {Function} [optionsResolver] Optional resolver that returns calculation options
   *   for a given segment.
   *
   * @returns {{
   *   savedKgUser: number,
   *   savedKgSystem: number,
   *   context: {
   *     segmentCount: number
   *   }
   * }}
   */
  calculateSavedFromSegments(segments, optionsResolver = () => ({})) {
    if (!Array.isArray(segments)) {
      throw new TypeError('segments must be an array')
    }

    const total = {
      savedKgUser: 0,
      savedKgSystem: 0,
      context: {
        segmentCount: segments.length,
      },
    }

    for (let i = 0; i < segments.length; i += 1) {
      const segment = this._validateSegment(segments[i], i)
      const options = optionsResolver(segment, i) || {}

      const result = this.calculateSaved(
        segment.distanceKm,
        segment.transportationMode,
        options
      )

      total.savedKgUser += result.savedKgUser
      total.savedKgSystem += result.savedKgSystem
    }

    total.savedKgUser = this._roundKg(total.savedKgUser)
    total.savedKgSystem = this._roundKg(total.savedKgSystem)

    return total
  }
}

const defaultCo2Calculator = new Co2Calculator()

module.exports = { Co2Calculator, defaultCo2Calculator }
