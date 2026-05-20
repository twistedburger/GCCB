const { BadgeEvaluator } = require('../BadgeEvaluator')

const mockBadgeQueries = {
  fetchUnearnedBadges: jest.fn(),
  fetchRouteCount: jest.fn(),
  awardBadge: jest.fn(),
  upsertBadgeProgress: jest.fn(),
  fetchUserBadgeDetails: jest.fn(),
}

let badgeEvaluator

beforeEach(() => {
  Object.values(mockBadgeQueries).forEach(fn => fn.mockReset())
  badgeEvaluator = new BadgeEvaluator({ badgeQueries: mockBadgeQueries })
})

const mockSummary = {
  totalCo2SavedKg: 10,
  tripCount: 5,
  tripFrequenciesByMode: {
    transit: 2,
    bicycle: 1,
    car: 1,
    walk: 1,
  },
}

describe('BadgeEvaluator.getBadgeMetricValue', () => {
  test('should resolve co2_saved_kg from summary', () => {
    const badge = { metric: 'co2_saved_kg', metric_arg: null }
    expect(badgeEvaluator.getBadgeMetricValue(badge, mockSummary, 3)).toBe(10)
  })

  test('should resolve trip_count from summary', () => {
    const badge = { metric: 'trip_count', metric_arg: null }
    expect(badgeEvaluator.getBadgeMetricValue(badge, mockSummary, 3)).toBe(5)
  })

  test('should resolve mode_trips using metric_arg', () => {
    const badge = { metric: 'mode_trips', metric_arg: 'transit' }
    expect(badgeEvaluator.getBadgeMetricValue(badge, mockSummary, 3)).toBe(2)
  })

  test('should resolve when mode_trips returns 0 for unknown mode', () => {
    const badge = { metric: 'mode_trips', metric_arg: 'unknown_mode' }
    expect(badgeEvaluator.getBadgeMetricValue(badge, mockSummary, 3)).toBe(0)
  })

  test('should resolve routes_created from routeCount param', () => {
    const badge = { metric: 'routes_created', metric_arg: null }
    expect(badgeEvaluator.getBadgeMetricValue(badge, mockSummary, 7)).toBe(7)
  })

  test('should return 0 for unknown metric', () => {
    const badge = { metric: 'unknown_metric', metric_arg: null }
    expect(badgeEvaluator.getBadgeMetricValue(badge, mockSummary, 3)).toBe(0)
  })

  test('should return 0 when summary is null', () => {
    const badge = { metric: 'co2_saved_kg', metric_arg: null }
    expect(badgeEvaluator.getBadgeMetricValue(badge, null, 3)).toBe(0)
  })
})

describe('BadgeEvaluator.evaluateBadges', () => {
  test('should award badge when current value meets threshold', async () => {
    const badge = {
      id: 1,
      key: 'first_step',
      metric: 'co2_saved_kg',
      metric_arg: null,
      threshold: 1,
    }
    mockBadgeQueries.fetchUnearnedBadges.mockResolvedValueOnce([badge])
    mockBadgeQueries.fetchRouteCount.mockResolvedValueOnce(0)
    mockBadgeQueries.awardBadge.mockResolvedValueOnce()

    const awarded = await badgeEvaluator.evaluateBadges(1, mockSummary)

    expect(mockBadgeQueries.awardBadge).toHaveBeenCalledWith(1, 1)
    expect(mockBadgeQueries.upsertBadgeProgress).not.toHaveBeenCalled()
    expect(awarded).toEqual(['first_step'])
  })

  test('should upsert progress when current value is below threshold', async () => {
    const badge = {
      id: 2,
      key: 'carbon_cutter',
      metric: 'co2_saved_kg',
      metric_arg: null,
      threshold: 50,
    }
    mockBadgeQueries.fetchUnearnedBadges.mockResolvedValueOnce([badge])
    mockBadgeQueries.fetchRouteCount.mockResolvedValueOnce(0)
    mockBadgeQueries.upsertBadgeProgress.mockResolvedValueOnce()

    const awarded = await badgeEvaluator.evaluateBadges(1, mockSummary)

    expect(mockBadgeQueries.upsertBadgeProgress).toHaveBeenCalledWith(1, 2, 10)
    expect(mockBadgeQueries.awardBadge).not.toHaveBeenCalled()
    expect(awarded).toEqual([])
  })

  test('should award multiple badges in one evaluation', async () => {
    const badges = [
      {
        id: 1,
        key: 'first_step',
        metric: 'co2_saved_kg',
        metric_arg: null,
        threshold: 1,
      },
      {
        id: 2,
        key: 'first_ride',
        metric: 'trip_count',
        metric_arg: null,
        threshold: 1,
      },
    ]
    mockBadgeQueries.fetchUnearnedBadges.mockResolvedValueOnce(badges)
    mockBadgeQueries.fetchRouteCount.mockResolvedValueOnce(0)
    mockBadgeQueries.awardBadge.mockResolvedValue()

    const awarded = await badgeEvaluator.evaluateBadges(1, mockSummary)

    expect(mockBadgeQueries.awardBadge).toHaveBeenCalledTimes(2)
    expect(awarded).toEqual(['first_step', 'first_ride'])
  })

  test('should return an empty array when no badges are unearned', async () => {
    mockBadgeQueries.fetchUnearnedBadges.mockResolvedValueOnce([])
    mockBadgeQueries.fetchRouteCount.mockResolvedValueOnce(0)

    const awarded = await badgeEvaluator.evaluateBadges(1, mockSummary)

    expect(awarded).toEqual([])
    expect(mockBadgeQueries.awardBadge).not.toHaveBeenCalled()
    expect(mockBadgeQueries.upsertBadgeProgress).not.toHaveBeenCalled()
  })

  test('should evaluate mode_trips badges using metricArg', async () => {
    const badge = {
      id: 5,
      key: 'transit_trekker',
      metric: 'mode_trips',
      metric_arg: 'transit',
      threshold: 3,
    }
    mockBadgeQueries.fetchUnearnedBadges.mockResolvedValueOnce([badge])
    mockBadgeQueries.fetchRouteCount.mockResolvedValueOnce(0)
    mockBadgeQueries.upsertBadgeProgress.mockResolvedValueOnce()

    // summary has transit: 2, below threshold of 3
    await badgeEvaluator.evaluateBadges(1, mockSummary)

    expect(mockBadgeQueries.upsertBadgeProgress).toHaveBeenCalledWith(1, 5, 2)
    expect(mockBadgeQueries.awardBadge).not.toHaveBeenCalled()
  })

  test('should award routes_created badge using fetchRouteCount', async () => {
    const badge = {
      id: 8,
      key: 'route_rookie',
      metric: 'routes_created',
      metric_arg: null,
      threshold: 1,
    }
    mockBadgeQueries.fetchUnearnedBadges.mockResolvedValueOnce([badge])
    mockBadgeQueries.fetchRouteCount.mockResolvedValueOnce(3)
    mockBadgeQueries.awardBadge.mockResolvedValueOnce()

    const awarded = await badgeEvaluator.evaluateBadges(1, mockSummary)

    expect(mockBadgeQueries.awardBadge).toHaveBeenCalledWith(1, 8)
    expect(awarded).toEqual(['route_rookie'])
  })

  test('should award badge at exact threshold', async () => {
    const badge = {
      id: 3,
      key: 'frequent_flyer',
      metric: 'trip_count',
      metric_arg: null,
      threshold: 5,
    }
    mockBadgeQueries.fetchUnearnedBadges.mockResolvedValueOnce([badge])
    mockBadgeQueries.fetchRouteCount.mockResolvedValueOnce(0)
    mockBadgeQueries.awardBadge.mockResolvedValueOnce()

    const awarded = await badgeEvaluator.evaluateBadges(1, mockSummary)

    expect(mockBadgeQueries.awardBadge).toHaveBeenCalledWith(1, 3)
    expect(awarded).toContain('frequent_flyer')
  })
})

describe('BadgeEvaluator.getBadgesForUser', () => {
  test('should delegate to fetchUserBadgeDetails', async () => {
    const mockBadges = [{ id: 1, key: 'first_step', earned: true }]
    mockBadgeQueries.fetchUserBadgeDetails.mockResolvedValueOnce(mockBadges)

    const result = await badgeEvaluator.getBadgesForUser(1)

    expect(mockBadgeQueries.fetchUserBadgeDetails).toHaveBeenCalledWith(1)
    expect(result).toEqual(mockBadges)
  })

  test('should return empty array when user has no badge data', async () => {
    mockBadgeQueries.fetchUserBadgeDetails.mockResolvedValueOnce([])

    const result = await badgeEvaluator.getBadgesForUser(1)

    expect(result).toEqual([])
  })
})
