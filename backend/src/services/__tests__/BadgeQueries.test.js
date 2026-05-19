const { BadgeServices } = require('../BadgeServices')

const mockDb = { query: jest.fn() }
let badgeQueries

beforeEach(() => {
  mockDb.query.mockReset()
  badgeQueries = new BadgeServices({ db: mockDb })
})

describe('BadgeQueries.fetchUnearnedBadges', () => {
  test('should return unearned badge rows for a user', async () => {
    const mockBadges = [
      {
        id: 1,
        key: 'first_step',
        metric: 'co2_saved_kg',
        threshold: 1,
        tier: 1,
      },
      {
        id: 2,
        key: 'carbon_cutter',
        metric: 'co2_saved_kg',
        threshold: 10,
        tier: 1,
      },
    ]
    mockDb.query.mockResolvedValueOnce({ rows: mockBadges })

    const result = await badgeQueries.fetchUnearnedBadges(1)

    expect(result).toEqual(mockBadges)
    expect(mockDb.query).toHaveBeenCalledTimes(1)
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('NOT EXISTS'),
      [1]
    )
  })

  test('should return an empty array when all badges are earned', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    const result = await badgeQueries.fetchUnearnedBadges(1)

    expect(result).toEqual([])
  })
})

describe('BadgeQueries.fetchRouteCount', () => {
  test('should return the count of routes created by the user', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ count: 5 }] })

    const result = await badgeQueries.fetchRouteCount(1)

    expect(result).toBe(5)
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('creator_id'),
      [1]
    )
  })

  test('should return 0 when user has not created a route', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ count: 0 }] })

    const result = await badgeQueries.fetchRouteCount(1)

    expect(result).toBe(0)
  })
})

describe('BadgeQueries.awardBadge', () => {
  test('should insert into user_badge with correct params', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    await badgeQueries.awardBadge(1, 5)

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_badge'),
      [1, 5]
    )
  })

  test('should use ON CONFLICT DO NOTHING to handle duplicate badges', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    await badgeQueries.awardBadge(1, 5)

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT'),
      expect.any(Array)
    )
  })
})

describe('BadgeQueries.upsertBadgeProgress', () => {
  test('should insert badge progress with correct params', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    await badgeQueries.upsertBadgeProgress(1, 3, 4.5)

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO badge_progress'),
      [1, 3, 4.5]
    )
  })

  test('should update current_value on conflict', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    await badgeQueries.upsertBadgeProgress(1, 3, 7.2)

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('DO UPDATE SET'),
      expect.any(Array)
    )
  })
})

describe('BadgeQueries.fetchUserBadgeDetails', () => {
  test('should returns badges ordered by tier, descending', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    await badgeQueries.fetchUserBadgeDetails(1)

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY b.tier DESC'),
      [1]
    )
  })

  test('should return an empty array when user has no badges', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] })

    const result = await badgeQueries.fetchUserBadgeDetails(1)

    expect(result).toEqual([])
  })
})
