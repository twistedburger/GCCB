const { AnalyticsServices } = require('../AnalyticsServices')
const { EMISSIONS_G_PER_KM } = require('../../constants/emissions')
const mockDb = { query: jest.fn() }

const mockCo2Calculator = {
  calculateSaved: jest.fn((distanceKm, mode) => ({
    savedKgUser: distanceKm * 0.5,
    savedKgSystem: distanceKm * 0.8,
    context: { mode },
  })),
  calculateSavedFromSegments: jest.fn(segments => ({
    savedKgUser: segments.reduce((s, seg) => s + seg.distanceKm * 0.5, 0),
    savedKgSystem: segments.reduce((s, seg) => s + seg.distanceKm * 0.8, 0),
    context: {},
  })),
}

let analyticsServices

beforeEach(() => {
  mockDb.query.mockReset()
  mockCo2Calculator.calculateSaved.mockClear()
  mockCo2Calculator.calculateSavedFromSegments.mockClear()
  analyticsServices = new AnalyticsServices({
    db: mockDb,
    co2Calculator: mockCo2Calculator,
  })
})

const walkRoute = {
  id: 1,
  creatorId: 10,
  transportationMode: 'walk',
  distance: '5',
  path: null,
}

const transitRouteWithPath = {
  id: 2,
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

const carRoute = {
  id: 3,
  creatorId: 10,
  transportationMode: 'Car',
  distance: '15',
  path: {
    legs: [{ steps: [{ travelMode: 'DRIVING', distanceMeters: 15000 }] }],
  },
}

describe('AnalyticsServices.fetchCompletedRoutes', () => {
  test('should fetch only user-participated routes for users', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ id: 1, completed: true }] })

    const result = await analyticsServices.fetchCompletedRoutes(1, false)

    expect(result).toHaveLength(1)
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('user_route'),
      expect.arrayContaining([1])
    )
  })

  test('should return an empty array if no completed routes exist', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    const result = await analyticsServices.fetchCompletedRoutes(1, true)

    expect(result).toEqual([])
  })

  test('should use ORDER BY when orderByDepartTime boolean flag is set true', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    await analyticsServices.fetchCompletedRoutes(1, false, {
      orderByDepartTime: true,
    })

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY r.depart_time DESC'),
      expect.any(Array)
    )
  })
})

describe('AnalyticsServices.getCarpoolContext', () => {
  test('should include the creator in passenger count when creator is also a participant', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ participant_count: 3, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const { passengers } = await analyticsServices.getCarpoolContext(1, 10)

    expect(passengers).toBe(3)
  })

  test('should add 1 for participant count when creator is not a participant', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ participant_count: 2, creator_included: false }],
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const { passengers } = await analyticsServices.getCarpoolContext(1, 10)

    expect(passengers).toBe(3)
  })

  test('should use electric factor when creator has EV', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ participant_count: 2, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [{ e_v: true }], rowCount: 1 })

    const { vehicleFactor } = await analyticsServices.getCarpoolContext(1, 10)

    expect(vehicleFactor).toBe(EMISSIONS_G_PER_KM.CAR_VEHICLE.ELECTRIC)
  })

  test('should use petrol emission factor by default', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ participant_count: 2, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const { vehicleFactor } = await analyticsServices.getCarpoolContext(1, 10)

    expect(vehicleFactor).toBe(EMISSIONS_G_PER_KM.CAR_VEHICLE.PETROL)
  })

  test('should default passenger count to 1 when rows are empty', async () => {
    mockDb.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const { passengers } = await analyticsServices.getCarpoolContext(1, 10)

    // participantCount = 0, if creator_included = false, then 0 + 1 = 1
    expect(passengers).toBe(1)
  })
})

describe('AnalyticsServices.fetchCarpoolContextsBatch', () => {
  test('should return an empty map for empty input', async () => {
    const result = await analyticsServices.fetchCarpoolContextsBatch([])
    expect(result.size).toBe(0)
    expect(mockDb.query).not.toHaveBeenCalled()
  })

  test('should returns the correct number of passengers for single route', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ route_id: 3, participant_count: 2, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [] })

    const result = await analyticsServices.fetchCarpoolContextsBatch([carRoute])

    expect(result.get(3)).toMatchObject({ passengers: 2 })
  })

  test('should add 1 for creator not in participants', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ route_id: 3, participant_count: 2, creator_included: false }],
      })
      .mockResolvedValueOnce({ rows: [] })

    const result = await analyticsServices.fetchCarpoolContextsBatch([carRoute])

    expect(result.get(3).passengers).toBe(3)
  })

  test('should use electric factor for EV creator', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ route_id: 3, participant_count: 2, creator_included: true }],
      })
      .mockResolvedValueOnce({
        rows: [{ driver_id: 10, e_v: true }],
      })

    const result = await analyticsServices.fetchCarpoolContextsBatch([carRoute])

    expect(result.get(3).vehicleFactor).toBe(
      EMISSIONS_G_PER_KM.CAR_VEHICLE.ELECTRIC
    )
  })

  test('should use petrol emission factor by default', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ route_id: 3, participant_count: 2, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [] })

    const result = await analyticsServices.fetchCarpoolContextsBatch([carRoute])

    expect(result.get(3).vehicleFactor).toBe(
      EMISSIONS_G_PER_KM.CAR_VEHICLE.PETROL
    )
  })

  test('should make exactly two DB queries regardless of route count', async () => {
    const routes = [carRoute, { ...carRoute, id: 4, creatorId: 11 }]
    mockDb.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })

    await analyticsServices.fetchCarpoolContextsBatch(routes)

    expect(mockDb.query).toHaveBeenCalledTimes(2)
  })
})

describe('AnalyticsServices.computeRouteSavings', () => {
  test('should use segment data when path is present', async () => {
    const result =
      await analyticsServices.computeRouteSavings(transitRouteWithPath)
    expect(result.savedKgSystem).toBeGreaterThan(0)
    expect(mockCo2Calculator.calculateSavedFromSegments).toHaveBeenCalled()
  })

  test('should call getCarpoolContext when route has car segment', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ participant_count: 3, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    await analyticsServices.computeRouteSavings(carRoute)

    expect(mockDb.query).toHaveBeenCalledTimes(2)
  })

  test('should return zero savings for routes with no distance', async () => {
    const route = { ...walkRoute, distance: '0' }
    const result = await analyticsServices.computeRouteSavings(route)
    expect(result.savedKgSystem).toBe(0)
    expect(result.savedKgUser).toBe(0)
  })

  test('should default distanceKm to 0 when distance is null', async () => {
    const route = { ...walkRoute, distance: null }
    const result = await analyticsServices.computeRouteSavings(route)
    expect(result.savedKgSystem).toBe(0)
  })
})

describe('AnalyticsServices.toAnalyticsContributions', () => {
  test('should return multiple contributions from path segments', async () => {
    const contributions = await analyticsServices.toAnalyticsContributions(
      transitRouteWithPath,
      false
    )
    expect(contributions).toHaveLength(2)
  })

  test('should assign tripCount=1 to the dominant mode segment', async () => {
    const contributions = await analyticsServices.toAnalyticsContributions(
      transitRouteWithPath,
      false
    )
    const withTrip = contributions.filter(c => c.tripCount === 1)
    expect(withTrip).toHaveLength(1)
    expect(withTrip[0].mode).toBe('transit')
  })

  test('should fetch carpool context when path contains a car segment', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [{ participant_count: 3, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })

    await analyticsServices.toAnalyticsContributions(carRoute, true)

    expect(mockDb.query).toHaveBeenCalledTimes(2)
  })

  test('should return single contribution for route without path', async () => {
    const contributions = await analyticsServices.toAnalyticsContributions(
      walkRoute,
      false
    )
    expect(contributions).toHaveLength(1)
    expect(contributions[0].tripCount).toBe(1)
  })

  test('should default distanceKm to 0 when distance is null', async () => {
    const route = { ...walkRoute, distance: null }
    const contributions = await analyticsServices.toAnalyticsContributions(
      route,
      false
    )
    expect(contributions[0].distanceKm).toBe(0)
  })
})

describe('AnalyticsServices.buildAnalyticsSummary', () => {
  test('should return summary containing all zeroes when no routes', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    const summary = await analyticsServices.buildAnalyticsSummary(1, false)

    expect(summary.tripCount).toBe(0)
    expect(summary.totalDistanceKm).toBe(0)
    expect(summary.totalCo2SavedKg).toBe(0)
  })

  test('should increment tripCount for each route', async () => {
    mockDb.query.mockResolvedValueOnce({
      rows: [walkRoute, { ...walkRoute, id: 2 }],
    })

    const summary = await analyticsServices.buildAnalyticsSummary(1, false)

    expect(summary.tripCount).toBe(2)
  })

  test('should accumulate tripFrequenciesByMode correctly', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [walkRoute] })

    const summary = await analyticsServices.buildAnalyticsSummary(1, false)

    expect(summary.tripFrequenciesByMode.walk).toBe(1)
  })

  test('should call fetchCarpoolContextsBatch for car routes not getCarpoolContext directly', async () => {
    mockDb.query
      .mockResolvedValueOnce({ rows: [carRoute] })
      .mockResolvedValueOnce({
        rows: [{ route_id: 3, participant_count: 2, creator_included: true }],
      })
      .mockResolvedValueOnce({ rows: [] })

    const spy = jest.spyOn(analyticsServices, 'getCarpoolContext')
    await analyticsServices.buildAnalyticsSummary(1, false)

    expect(spy).not.toHaveBeenCalled()
    expect(mockDb.query).toHaveBeenCalledTimes(3)
  })

  test('should set scope to system for admin', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    const summary = await analyticsServices.buildAnalyticsSummary(1, true)

    expect(summary.scope).toBe('system')
  })

  test('should set scope to user for user', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    const summary = await analyticsServices.buildAnalyticsSummary(1, false)

    expect(summary.scope).toBe('user')
  })
})
