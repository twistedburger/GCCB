const {
  normalizeMode,
  toAnalyticsMode,
  getTransitStepMode,
  getStepTransportationMode,
  roundToTwoDecimals,
  getRoutePathObject,
  extractRouteSegments,
} = require('../AnalyticsUtils')

describe('normalizeMode', () => {
  test('should trim input and return lowercased', () => {
    expect(normalizeMode('  Bus  ')).toBe('bus')
  })

  test('should not throw error with null/undefined', () => {
    expect(normalizeMode(null)).toBe('')
    expect(normalizeMode(undefined)).toBe('')
  })
})

describe('toAnalyticsMode', () => {
  test.each([
    ['    walk   ', 'walk'],
    ['walking', 'walk'],
    ['bicycle', 'bicycle'],
    ['bicycling', 'bicycle'],
    ['bus', 'transit'],
    ['intercity_bus', 'transit'],
    ['transit', 'transit'],
    ['rail', 'rail'],
    ['subway', 'rail'],
    ['train', 'rail'],
    ['car', 'car'],
    ['driving', 'car'],
  ])('should map %s to %s', (input, expected) => {
    expect(toAnalyticsMode(input)).toBe(expected)
  })

  test("should return 'other' for unrecognised modes", () => {
    expect(toAnalyticsMode('teleport')).toBe('other')
  })

  test('should be case-insensitive', () => {
    expect(toAnalyticsMode('WALK')).toBe('walk')
  })
})

describe('getTransitStepMode', () => {
  test('should default to transit when step has no transitDetails', () => {
    expect(getTransitStepMode({})).toBe('transit')
  })

  test('should return transit when vehicle type is unrecognised mode', () => {
    const step = {
      transitDetails: { transitLine: { vehicle: { type: 'plane' } } },
    }
    expect(getTransitStepMode(step)).toBe('transit')
  })

  test('should return rail for train type', () => {
    const step = {
      transitDetails: { transitLine: { vehicle: { type: 'monorail' } } },
    }
    expect(getTransitStepMode(step)).toBe('rail')
  })
})

describe('getStepTransportationMode', () => {
  test('should resolve WALKING step to walk', () => {
    expect(getStepTransportationMode({ travelMode: 'WALKING' })).toBe('walk')
  })

  test('should delegate TRANSIT step to getTransitStepMode', () => {
    const step = {
      travelMode: 'TRANSIT',
      transitDetails: { transitLine: { vehicle: { type: 'SUBWAY' } } },
    }
    expect(getStepTransportationMode(step)).toBe('rail')
  })

  test('should use transit for TRANSIT step as fallback with unknown vehicle', () => {
    const step = {
      travelMode: 'TRANSIT',
      transitDetails: { transitLine: { vehicle: { type: 'UNKNOWN' } } },
    }
    expect(getStepTransportationMode(step)).toBe('transit')
  })

  test('should resolve DRIVING step to car', () => {
    expect(getStepTransportationMode({ travelMode: 'DRIVING' })).toBe('car')
  })
})

describe('roundToTwoDecimals', () => {
  test('should round to two decimal places', () => {
    expect(roundToTwoDecimals(1.234)).toBe(1.23)
    expect(roundToTwoDecimals(1.276)).toBe(1.28)
  })

  test('should leave pre-rounded numbers alone', () => {
    expect(roundToTwoDecimals(1.7)).toBe(1.7)
  })
})

describe('getRoutePathObject', () => {
  test('should return null when path is null', () => {
    expect(getRoutePathObject({ path: null })).toBeNull()
  })

  test('should return null when path is undefined', () => {
    expect(getRoutePathObject({})).toBeNull()
  })

  test('should return object directly when already parsed', () => {
    const path = { legs: [] }
    expect(getRoutePathObject({ path })).toBe(path)
  })

  test('should parse valid JSON string', () => {
    const path = { legs: [{ steps: [] }] }
    expect(getRoutePathObject({ path: JSON.stringify(path) })).toEqual(path)
  })

  test('should return null for invalid JSON string', () => {
    expect(getRoutePathObject({ path: '{invalid' })).toBeNull()
  })
})

describe('extractRouteSegments', () => {
  test('should return an empty array when a route has no path', () => {
    expect(extractRouteSegments({ path: null })).toEqual([])
  })

  test('should extract leg segments from a path', () => {
    const route = {
      path: {
        legs: [
          {
            steps: [
              { travelMode: 'WALKING', distanceMeters: 500 },
              {
                travelMode: 'TRANSIT',
                distanceMeters: 8000,
                transitDetails: { transitLine: { vehicle: { type: 'BUS' } } },
              },
            ],
          },
        ],
      },
    }
    const segments = extractRouteSegments(route)
    expect(segments).toHaveLength(2)
    expect(segments[0].transportationMode).toBe('walk')
    expect(segments[0].distanceKm).toBe(0.5)
    expect(segments[1].transportationMode).toBe('transit')
    expect(segments[1].distanceKm).toBe(8)
  })

  test('should ignore steps with no distance', () => {
    const route = {
      path: {
        legs: [
          {
            steps: [
              { travelMode: 'WALKING', distanceMeters: 0 },
              { travelMode: 'WALKING', distanceMeters: 300 },
            ],
          },
        ],
      },
    }
    expect(extractRouteSegments(route)).toHaveLength(1)
  })

  test('should parse JSON strings correctly', () => {
    const route = {
      path: JSON.stringify({
        legs: [{ steps: [{ travelMode: 'BICYCLING', distanceMeters: 5000 }] }],
      }),
    }
    const segments = extractRouteSegments(route)
    expect(segments).toHaveLength(1)
    expect(segments[0].transportationMode).toBe('bicycle')
  })

  test('should return an empty array for invalid path', () => {
    expect(extractRouteSegments({ path: '{invalid' })).toEqual([])
  })

  test('should handle missing leg steps property', () => {
    const route = {
      path: {
        legs: [
          {}, // no steps
          { steps: [{ travelMode: 'WALKING', distanceMeters: 400 }] },
        ],
      },
    }
    const segments = extractRouteSegments(route)
    expect(segments).toHaveLength(1)
    expect(segments[0].transportationMode).toBe('walk')
  })
})
