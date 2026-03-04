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

    // Default total people in a carpool
    defaultPassengers = DEFAULT_PASSENGERS,
  } = {}) {
    this.baselineCarFactor = this._validateNumber(
      baselineCarFactor,
      'baselineCarFactor'
    )
    this.busFactor = this._validateNumber(busFactor, 'busFactor')
    this.defaultPassengers = this._validatePositiveInteger(
      defaultPassengers,
      'defaultPassengers'
    )
  }

  _validateNumber(value, paramName) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new TypeError(`${paramName} must be a number`)
    }
    if (value < 0) {
      throw new RangeError(`${paramName} must be >= 0`)
    }
    return value
  }

  _validatePositiveInteger(value, paramName) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new TypeError(`${paramName} must be a positive integer`)
    }
    return value
  }

  _normalizeMode(mode) {
    return String(mode || '')
      .trim()
      .toLowerCase()
  }

  // default to 2
  _getPassengerCount(passengers) {
    return Number.isInteger(passengers) && passengers > 0
      ? passengers
      : this.defaultPassengers
  }

  _roundKg(value) {
    return Math.round(value * 100) / 100
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

    // Handler for bus / transit (treat the same for now)
    const busHandler = () => {
      const savedKg = Math.max(
        0, // clamp to 0 if for any unrealistic reason a bus is less efficient than a car to prevent negative savings
        (distanceKm * (this.baselineCarFactor - this.busFactor)) / GRAMS_PER_KG
      )

      const rounded = this._roundKg(savedKg)

      result.savedKgUser = rounded
      result.savedKgSystem = rounded
      result.context = { transitMode: 'bus' }
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
}

const defaultCo2Calculator = new Co2Calculator()

module.exports = { Co2Calculator, defaultCo2Calculator }
