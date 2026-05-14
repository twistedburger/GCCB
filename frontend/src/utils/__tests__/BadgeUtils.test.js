import {
  VIEWS,
  CATEGORIES,
  CATEGORY_ORDER,
  progressWidth,
  metricUnit,
  filterForView,
} from '../../utils/BadgeUtils'

const earnedBadge = {
  id: 1,
  key: 'first_step',
  title: 'First Step',
  category: 'eco_impact',
  tier: 1,
  earned: true,
  dateEarned: '2026-05-01T00:00:00.000Z',
  currentValue: 1,
  progress: 1,
}

const inProgressBadge = {
  id: 2,
  key: 'carbon_cutter',
  title: 'Carbon Cutter',
  category: 'eco_impact',
  tier: 1,
  earned: false,
  dateEarned: null,
  currentValue: 4.2,
  progress: 0.42,
}

const lockedBadge = {
  id: 3,
  key: 'goin_green',
  title: "Goin' Green",
  category: 'eco_impact',
  tier: 2,
  earned: false,
  dateEarned: null,
  currentValue: 0,
  progress: 0,
}

const badges = [earnedBadge, inProgressBadge, lockedBadge]

describe('VIEWS', () => {
  test('should be immutable', () => {
    expect(Object.isFrozen(VIEWS)).toBe(true)
  })

  test('should contain ALL, EARNED, and IN_PROGRESS keys for VIEWS', () => {
    expect(VIEWS).toHaveProperty('ALL')
    expect(VIEWS).toHaveProperty('EARNED')
    expect(VIEWS).toHaveProperty('IN_PROGRESS')
  })
})

describe('CATEGORIES', () => {
  test('should be immutable', () => {
    expect(Object.isFrozen(CATEGORIES)).toBe(true)
  })

  test('should contain expected category keys', () => {
    expect(CATEGORIES).toHaveProperty('ECO_IMPACT')
    expect(CATEGORIES).toHaveProperty('TRIPS')
    expect(CATEGORIES).toHaveProperty('MODES')
    expect(CATEGORIES).toHaveProperty('SOCIAL')
  })
})

describe('CATEGORY_ORDER', () => {
  test('should contain all category values', () => {
    expect(CATEGORY_ORDER).toContain(CATEGORIES.ECO_IMPACT)
    expect(CATEGORY_ORDER).toContain(CATEGORIES.TRIPS)
    expect(CATEGORY_ORDER).toContain(CATEGORIES.MODES)
    expect(CATEGORY_ORDER).toContain(CATEGORIES.SOCIAL)
  })

  test('ECO_IMPACT should appear before TRIPS', () => {
    expect(CATEGORY_ORDER.indexOf(CATEGORIES.ECO_IMPACT)).toBeLessThan(
      CATEGORY_ORDER.indexOf(CATEGORIES.TRIPS)
    )
  })
})

describe('progressWidth', () => {
  test('should return correct percentage string for a fraction', () => {
    expect(progressWidth(0.42)).toBe('42%')
  })

  test('should fallback to 0% for negative values', () => {
    expect(progressWidth(-0.5)).toBe('0%')
  })

  test('should remain 100% for values above 1', () => {
    expect(progressWidth(1.5)).toBe('100%')
  })

  test('should return 0% for null or undefined', () => {
    expect(progressWidth(null)).toBe('0%')
    expect(progressWidth(undefined)).toBe('0%')
  })

  test('should return 100% for exactly 1', () => {
    expect(progressWidth(1)).toBe('100%')
  })

  test('should return 0% for exactly 0', () => {
    expect(progressWidth(0)).toBe('0%')
  })
})

describe('metricUnit', () => {
  test.each([
    ['co2_saved_kg', 'kg'],
    ['trip_count', 'trips'],
    ['mode_trips', 'trips'],
    ['routes_created', 'routes'],
  ])('should return correct unit for %s', (metric, expected) => {
    expect(metricUnit(metric)).toBe(expected)
  })

  test('should return an empty string for unknown metric', () => {
    expect(metricUnit('unknown_metric')).toBe('')
  })

  test('should return an empty string for null', () => {
    expect(metricUnit(null)).toBe('')
  })
})

describe('filterForView', () => {
  test('ALL view should return all badges unchanged', () => {
    const result = filterForView(badges, VIEWS.ALL)
    expect(result).toHaveLength(3)
  })

  test('EARNED view should return only earned badges', () => {
    const result = filterForView(badges, VIEWS.EARNED)
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('first_step')
  })

  test('EARNED view should sort badges by dateEarned descending', () => {
    const earned1 = {
      ...earnedBadge,
      id: 1,
      dateEarned: '2026-04-01T00:00:00.000Z',
    }
    const earned2 = {
      ...earnedBadge,
      id: 2,
      dateEarned: '2026-05-01T00:00:00.000Z',
    }
    const result = filterForView([earned1, earned2], VIEWS.EARNED)
    expect(result[0].id).toBe(2)
    expect(result[1].id).toBe(1)
  })

  test('IN_PROGRESS view should return only in-progress badges', () => {
    const result = filterForView(badges, VIEWS.IN_PROGRESS)
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('carbon_cutter')
  })

  test('IN_PROGRESS view should sort by progress descending', () => {
    const inProgress1 = { ...inProgressBadge, id: 1, progress: 0.3 }
    const inProgress2 = { ...inProgressBadge, id: 2, progress: 0.7 }
    const result = filterForView([inProgress1, inProgress2], VIEWS.IN_PROGRESS)
    expect(result[0].id).toBe(2)
    expect(result[1].id).toBe(1)
  })

  test('IN_PROGRESS view should exclude locked badges', () => {
    const result = filterForView(badges, VIEWS.IN_PROGRESS)
    expect(result.find(b => b.key === 'goin_green')).toBeUndefined()
  })

  test('unknown view should return all badges as fallback', () => {
    const result = filterForView(badges, 'unknown_view')
    expect(result).toHaveLength(3)
  })

  test('should not be able to mutate the original array', () => {
    const original = [...badges]
    filterForView(badges, VIEWS.EARNED)
    expect(badges).toEqual(original)
  })
})
