const { Co2Calculator } = require('../Co2Calculator')
const { EMISSIONS_G_PER_KM } = require('../../constants/Emissions')

// Using current constants; if any of them change, refer to src/constants/emissions.js
const calc = new Co2Calculator({
  baselineCarFactor: 170,
  busFactor: 97,
  railFactor: 35,
  defaultPassengers: 2,
})

describe('Co2Calculator constructor', () => {
  test('constructs with default emission factors', () => {
    const c = new Co2Calculator()
    expect(c.baselineCarFactor).toBe(EMISSIONS_G_PER_KM.CAR_VEHICLE.PETROL)
    expect(c.busFactor).toBe(EMISSIONS_G_PER_KM.TRANSIT_PASSENGER.BUS)
    expect(c.railFactor).toBe(EMISSIONS_G_PER_KM.TRANSIT_PASSENGER.RAIL)
  })

  test('throws TypeError for non-numeric emission factor', () => {
    expect(() => new Co2Calculator({ baselineCarFactor: 'high' })).toThrow(
      TypeError
    )
  })

  test('throws RangeError for negative emission factor', () => {
    expect(() => new Co2Calculator({ busFactor: -10 })).toThrow(RangeError)
  })

  test('throws TypeError for non-integer defaultPassengers', () => {
    expect(() => new Co2Calculator({ defaultPassengers: 1.5 })).toThrow(
      TypeError
    )
  })

  test('throws TypeError for zero defaultPassengers', () => {
    expect(() => new Co2Calculator({ defaultPassengers: 0 })).toThrow(TypeError)
  })
})

describe('Zero distance', () => {
  test('should return zero savings for zero distance regardless of mode', () => {
    const result = calc.calculateSaved(0, 'walk')
    expect(result.savedKgUser).toBe(0)
    expect(result.savedKgSystem).toBe(0)
  })
})

describe('Walk and bicycle savings', () => {
  test('walk savedKgUser equals savedKgSystem', () => {
    const result = calc.calculateSaved(10, 'walk')
    expect(result.savedKgUser).toBe(result.savedKgSystem)
  })

  test('walking gives correct savings for 10 km (170g/km baseline)', () => {
    const result = calc.calculateSaved(10, 'walk')
    expect(result.savedKgSystem).toBe(1.7) // 10 * 170 / 1000
  })

  test('bike uses same calculation as walk', () => {
    const walk = calc.calculateSaved(10, 'walk')
    const bike = calc.calculateSaved(10, 'bicycle')
    expect(bike.savedKgSystem).toBe(walk.savedKgSystem)
  })

  test('mode string is normalized', () => {
    const result = calc.calculateSaved(10, '  Walk  ')
    expect(result.savedKgSystem).toBe(1.7)
  })
})

describe('Bus savings', () => {
  test('bus savings equals baseline minus bus factor per km', () => {
    const result = calc.calculateSaved(10, 'bus')
    const expected = ((170 - 97) * 10) / 1000
    expect(result.savedKgSystem).toBe(Math.round(expected * 100) / 100)
  })

  test('bus savedKgUser equals savedKgSystem', () => {
    const result = calc.calculateSaved(10, 'bus')
    expect(result.savedKgUser).toBe(result.savedKgSystem)
  })

  test('bus context includes transitMode', () => {
    const result = calc.calculateSaved(10, 'bus')
    expect(result.context.transitMode).toBe('bus')
  })
})

describe('Rail savings', () => {
  test('rail savings are higher than bus savings for same distance', () => {
    const bus = calc.calculateSaved(10, 'bus')
    const rail = calc.calculateSaved(10, 'rail')
    expect(rail.savedKgSystem).toBeGreaterThan(bus.savedKgSystem)
  })

  test('rail context includes transitMode', () => {
    const result = calc.calculateSaved(10, 'rail')
    expect(result.context.transitMode).toBe('rail')
  })
})

describe('Carpool savings & details', () => {
  test('car with 2 passengers: system savings split evenly', () => {
    const result = calc.calculateSaved(10, 'car', { passengers: 2 })
    expect(result.savedKgUser).toBe(
      Math.round((result.savedKgSystem / 2) * 100) / 100
    )
  })

  test('carpool with 4 passengers should produce higher system savings than 2 passengers', () => {
    const two = calc.calculateSaved(10, 'car', { passengers: 2 })
    const four = calc.calculateSaved(10, 'car', { passengers: 4 })
    expect(four.savedKgSystem).toBeGreaterThan(two.savedKgSystem)
  })

  test('ev cars should have higher savings than standard petrol', () => {
    const petrol = calc.calculateSaved(10, 'car', {
      passengers: 2,
      vehicleFactor: 170,
    })
    const ev = calc.calculateSaved(10, 'car', {
      passengers: 2,
      vehicleFactor: 47,
    })
    expect(ev.savedKgSystem).toBeGreaterThan(petrol.savedKgSystem)
  })

  test('car context includes passengers and vehicleFactor', () => {
    const result = calc.calculateSaved(10, 'car', { passengers: 3 })
    expect(result.context.passengers).toBe(3)
    expect(result.context.vehicleFactor).toBeDefined()
  })

  test('car with invalid passengers should fall back to defaultPassengers', () => {
    const result = calc.calculateSaved(10, 'car', { passengers: 0 })
    expect(result.context.passengers).toBe(2)
  })
})

describe('Unsupported modes', () => {
  test('throws RangeError for unknown mode', () => {
    expect(() => calc.calculateSaved(10, 'hoverboard')).toThrow(RangeError)
  })

  test('throws RangeError for empty mode string', () => {
    expect(() => calc.calculateSaved(10, '')).toThrow(RangeError)
  })
})

describe('Calculating from segments', () => {
  test('returns zero for empty segments array', () => {
    const result = calc.calculateSavedFromSegments([])
    expect(result.savedKgSystem).toBe(0)
    expect(result.context.segmentCount).toBe(0)
  })

  test('should sum savings across multiple segments', () => {
    const segments = [
      { transportationMode: 'walk', distanceKm: 2 },
      { transportationMode: 'bus', distanceKm: 10 },
    ]
    const walk = calc.calculateSaved(2, 'walk')
    const bus = calc.calculateSaved(10, 'bus')
    const result = calc.calculateSavedFromSegments(segments)
    const expected =
      Math.round((walk.savedKgSystem + bus.savedKgSystem) * 100) / 100
    expect(result.savedKgSystem).toBe(expected)
  })

  test('context should include correct segmentCount', () => {
    const segments = [
      { transportationMode: 'bicycle', distanceKm: 5 },
      { transportationMode: 'rail', distanceKm: 10 },
    ]
    const result = calc.calculateSavedFromSegments(segments)
    expect(result.context.segmentCount).toBe(2)
  })

  test('throws TypeError when segments is not an array', () => {
    expect(() => calc.calculateSavedFromSegments('not an array')).toThrow(
      TypeError
    )
  })

  test('throws TypeError when a segment is not an object', () => {
    expect(() => calc.calculateSavedFromSegments([null])).toThrow(TypeError)
    expect(() => calc.calculateSavedFromSegments(['bus'])).toThrow(TypeError)
  })

  test('throws RangeError when a segment is missing transportationMode', () => {
    expect(() => calc.calculateSavedFromSegments([{ distanceKm: 5 }])).toThrow(
      RangeError
    )
  })

  test('throws when segment distanceKm is not a valid number', () => {
    expect(() =>
      calc.calculateSavedFromSegments([
        { transportationMode: 'walk', distanceKm: 'over there!' },
      ])
    ).toThrow()
  })

  test('does not throw error when optionsResolver is null', () => {
    const segments = [{ transportationMode: 'walk', distanceKm: 5 }]
    const result = calc.calculateSavedFromSegments(segments, () => null)
    expect(result.savedKgSystem).toBeGreaterThan(0)
  })
})
