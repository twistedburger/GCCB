const { createAnalyticsHelpers } = require('../analytics_helpers')
const { Co2Calculator } = require('../co2_calculator')
const { EMISSIONS_G_PER_KM } = require('../../constants/emissions')

const mockDb = { query: jest.fn() }

const {
  normalizeMode,
  toAnalyticsMode,
  getTransitStepMode,
  extractRouteSegments,
  roundToTwoDecimals,
  fetchCompletedRoutes,
  getCarpoolContext,
  computeRouteSavings,
  toAnalyticsRecord,
  toAnalyticsContributions,
} = createAnalyticsHelpers({
  db: mockDb,
  co2Calculator: new Co2Calculator(),
  emissions: { EMISSIONS_G_PER_KM },
})

beforeEach(() => {
  mockDb.query.mockReset()
})

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
    ['bus', 'bus'],
    ['intercity_bus', 'bus'],
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

  test('is case-insensitive', () => {
    expect(toAnalyticsMode('WALK')).toBe('walk')
  })
})

describe('getTransitStepMode', () => {
  test('default to bus when step has no transitDetails', () => {
    expect(getTransitStepMode({})).toBe('bus')
  })

  test('returns bus when vehicle type is unrecognised mode', () => {
    const step = {
      transitDetails: { transitLine: { vehicle: { type: 'plane' } } },
    }
    expect(getTransitStepMode(step)).toBe('bus')
  })

  test('returns rail for train type', () => {
    const step = {
      transitDetails: { transitLine: { vehicle: { type: 'monorail' } } },
    }
    expect(getTransitStepMode(step)).toBe('rail')
  })
})

describe('roundToTwoDecimals', () => {
  test('should round to two decimal places', () => {
    expect(roundToTwoDecimals(1.234)).toBe(1.23)
    expect(roundToTwoDecimals(1.276)).toBe(1.28)
  })

  test('leave pre-rounded numbers alone', () => {
    expect(roundToTwoDecimals(1.7)).toBe(1.7)
  })
})

describe('extractRouteSegments', () => {
  test('return empty array when a route has no path', () => {
    expect(extractRouteSegments({ path: null })).toEqual([])
  })

  test('extract leg segments from a path', () => {
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
    expect(segments[1].transportationMode).toBe('bus')
    expect(segments[1].distanceKm).toBe(8)
  })

  test('steps with no distance are ignored', () => {
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
    const segments = extractRouteSegments(route)
    expect(segments).toHaveLength(1)
  })

  test('JSON strings should parse correctly', () => {
    const route = {
      path: JSON.stringify({
        legs: [{ steps: [{ travelMode: 'BICYCLING', distanceMeters: 5000 }] }],
      }),
    }
    const segments = extractRouteSegments(route)
    expect(segments).toHaveLength(1)
    expect(segments[0].transportationMode).toBe('bicycle')
  })

  test('returns empty array for invalid path', () => {
    expect(extractRouteSegments({ path: '{invalid' })).toEqual([])
  })
})

describe('fetchCompletedRoutes', () => {
  const mockRoutes = [{ id: 1, completed: true }]

  test('fetch only user-participated routes', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [mockRoutes[0]] })
    const result = await fetchCompletedRoutes(1, false)
    expect(result).toHaveLength(1)
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('user_route'),
      expect.arrayContaining([1])
    )
  })

  test('return empty array if no completed routes exist', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })
    const result = await fetchCompletedRoutes(1, true)
    expect(result).toEqual([])
  })
})

describe('getCarpoolContext', () => {
  test('should include the creator as part of passenger count when creator is also a participant', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ participant_count: 3, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const { passengers } = await getCarpoolContext(1, 10)
    expect(passengers).toBe(3)
  })

  test('should use electric factor when carpool selects EV', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ participant_count: 2, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [{ e_v: true }], rowCount: 1 })

    const { vehicleFactor } = await getCarpoolContext(1, 10)
    expect(vehicleFactor).toBe(EMISSIONS_G_PER_KM.CAR_VEHICLE.ELECTRIC)
  })
})

describe('computeRouteSavings', () => {
  test('use segment data given path', async () => {
    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'Bus',
      distance: '10',
      path: {
        legs: [
          {
            steps: [
              { travelMode: 'WALKING', distanceMeters: 500 },
              {
                travelMode: 'TRANSIT',
                distanceMeters: 9500,
                transitDetails: { transitLine: { vehicle: { type: 'BUS' } } },
              },
            ],
          },
        ],
      },
    }
    const result = await computeRouteSavings(route)
    expect(result.savedKgSystem).toBeGreaterThan(0)
  })

  test('queries getCarpoolContext when route has car segment in the path', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ participant_count: 3, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'Car',
      distance: '15',
      path: {
        legs: [{ steps: [{ travelMode: 'DRIVING', distanceMeters: 15000 }] }],
      },
    }
    await computeRouteSavings(route)
    expect(mockDb.query).toHaveBeenCalledTimes(2)
  })

  test('should return zero savings for routes with no distance', async () => {
    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'walk',
      distance: '0',
      path: null,
    }
    const result = await computeRouteSavings(route)
    expect(result.savedKgSystem).toBe(0)
    expect(result.savedKgUser).toBe(0)
  })

  test('queries getCarpoolContext when route has car segment', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ participant_count: 3, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'Car',
      distance: '15',
      path: null,
    }
    await computeRouteSavings(route)
    expect(mockDb.query).toHaveBeenCalledTimes(2)
  })
})

describe('toAnalyticsRecord', () => {
  test('record shape for a user (savedKgUser)', async () => {
    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'Bus',
      distance: '10',
      path: null,
    }
    const record = await toAnalyticsRecord(route, false)
    expect(record).toHaveProperty('mode')
    expect(record).toHaveProperty('distanceKm')
    expect(record).toHaveProperty('savedKg')
    expect(record).toHaveProperty('savings')
    expect(record.savedKg).toBe(record.savings.savedKgUser)
  })

  test("individual's savings count towards savedKgSystem for admin", async () => {
    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'walk',
      distance: '5',
      path: null,
    }
    const record = await toAnalyticsRecord(route, true)
    expect(record.savedKg).toBe(record.savings.savedKgSystem)
  })

  test('maps transportationMode to analytics category', async () => {
    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'Bicycle',
      distance: '8',
      path: null,
    }
    const record = await toAnalyticsRecord(route, false)
    expect(record.mode).toBe('bicycle')
  })
})

describe('toAnalyticsContributions', () => {
  test('returns multiple contributions from path segments', async () => {
    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'Bus',
      distance: '10',
      path: {
        legs: [
          {
            steps: [
              { travelMode: 'WALKING', distanceMeters: 500 },
              {
                travelMode: 'TRANSIT',
                distanceMeters: 9500,
                transitDetails: { transitLine: { vehicle: { type: 'BUS' } } },
              },
            ],
          },
        ],
      },
    }
    const contributions = await toAnalyticsContributions(route, false)
    expect(contributions).toHaveLength(2)
  })

  test('assigns tripCount=1 to the dominant mode segment', async () => {
    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'Bus',
      distance: '10',
      path: {
        legs: [
          {
            steps: [
              { travelMode: 'WALKING', distanceMeters: 500 },
              {
                travelMode: 'TRANSIT',
                distanceMeters: 9500,
                transitDetails: { transitLine: { vehicle: { type: 'BUS' } } },
              },
            ],
          },
        ],
      },
    }
    const contributions = await toAnalyticsContributions(route, false)
    const withTrip = contributions.filter(c => c.tripCount === 1)
    expect(withTrip).toHaveLength(1)
    expect(withTrip[0].mode).toBe('bus')
  })

  test('fetches carpool context when path contains a car segment', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ participant_count: 3, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'Car',
      distance: '12',
      path: {
        legs: [
          {
            steps: [{ travelMode: 'DRIVING', distanceMeters: 12000 }],
          },
        ],
      },
    }
    await toAnalyticsContributions(route, true)
    expect(mockDb.query).toHaveBeenCalledTimes(2)
  })

  test('uses savedKgSystem for admin, savedKgUser for user', async () => {
    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'walk',
      distance: '5',
      path: null,
    }
    const userContribs = await toAnalyticsContributions(route, false)
    const adminContribs = await toAnalyticsContributions(route, true)
    expect(userContribs[0].savedKg).toBe(adminContribs[0].savedKg)
  })
})

describe('orderByDepartTime', () => {
  test('use ORDER BY when orderByDepartTime is true', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })
    await fetchCompletedRoutes(1, true, { orderByDepartTime: true })
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY r.depart_time DESC')
    )
  })
})

describe('Empty participant rows', () => {
  test('defaults participant_count to 0 when rows are empty', async () => {
    mockDb.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
    const { passengers } = await getCarpoolContext(1, 10)
    // participantCount = 0 (fallback), creator_included = false, so 0 + 1 = 1
    expect(passengers).toBe(1)
  })
})

describe('Leg with no steps array', () => {
  test('handle leg missing steps property', () => {
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

describe('Null distance fallback', () => {
  test('defaults distanceKm to 0 when distance is null', async () => {
    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'walk',
      distance: null,
      path: null,
    }
    const record = await toAnalyticsRecord(route, false)
    expect(record.distanceKm).toBe(0)
  })
})

describe('Null distance in one transit mode fallback', () => {
  test('defaults distanceKm to 0 when distance is null', async () => {
    const route = {
      id: 1,
      creatorId: 10,
      transportationMode: 'bus',
      distance: null,
      path: null,
    }
    const contributions = await toAnalyticsContributions(route, false)
    expect(contributions[0].distanceKm).toBe(0)
  })
})
