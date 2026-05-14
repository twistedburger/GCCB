import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import BadgeCard from '../BadgeCard'

/* eslint-disable react/prop-types, react/display-name */
jest.mock(
  '@mui/icons-material',
  () =>
    new Proxy(
      {},
      { get: (_, name) => () => <div data-testid={`icon-${name}`} /> }
    )
)

jest.mock('../GenericCard', () => ({ children, customStyling }) => (
  <div data-testid="generic-card" className={customStyling}>
    {children}
  </div>
))

jest.mock('../../utils/BadgeUtils', () => ({
  progressWidth: progress => `${Math.round(progress * 100)}%`,
  metricUnit: metric =>
    ({
      co2_saved_kg: 'kg',
      trip_count: 'trips',
      mode_trips: 'trips',
      routes_created: 'routes',
    })[metric] ?? '',
}))

jest.mock('../../locales/en/ComponentStrings/BadgeStrings', () => ({
  badgesStrings: {
    earned: date => `Earned ${date}`,
    needed: (threshold, unit) => `${threshold} ${unit} needed`,
  },
}))
/* eslint-enable react/prop-types */

const baseBadge = {
  id: 1,
  key: 'first_step',
  title: 'First Step',
  category: 'eco_impact',
  tier: 1,
  metric: 'co2_saved_kg',
  threshold: 1,
  iconKey: 'leaf',
  earned: false,
  dateEarned: null,
  currentValue: 0,
  progress: 0,
}

const earnedBadge = {
  ...baseBadge,
  earned: true,
  dateEarned: '2026-05-01T00:00:00.000Z',
  currentValue: 1,
  progress: 1,
}
const inProgressBadge = { ...baseBadge, currentValue: 0.5, progress: 0.5 }
const lockedBadge = { ...baseBadge }

describe('BadgeCard in locked state', () => {
  test('should render nothing when locked and showLocked is false', () => {
    const { container } = render(<BadgeCard badge={lockedBadge} />)
    expect(container.firstChild).toBeNull()
  })

  test('should render when locked and showLocked is true', () => {
    render(<BadgeCard badge={lockedBadge} showLocked />)
    expect(screen.getByTestId('generic-card')).toBeInTheDocument()
  })

  test('should show threshold requirement when locked', () => {
    render(<BadgeCard badge={lockedBadge} showLocked />)
    expect(screen.getByText('1 kg needed')).toBeInTheDocument()
  })

  test('should apply the opacity class when locked', () => {
    render(<BadgeCard badge={lockedBadge} showLocked />)
    expect(screen.getByTestId('generic-card').className).toContain('opacity-60')
  })
})

describe('BadgeCard in earned state', () => {
  test('should renders without showLocked when earned', () => {
    render(<BadgeCard badge={earnedBadge} />)
    expect(screen.getByTestId('generic-card')).toBeInTheDocument()
  })

  test('should show earned date label', () => {
    render(<BadgeCard badge={earnedBadge} />)
    expect(screen.getByText(/Earned/)).toBeInTheDocument()
  })

  test('should not show progress bar when earned', () => {
    const { container } = render(<BadgeCard badge={earnedBadge} />)
    expect(container.querySelector('.h-1\\.5')).not.toBeInTheDocument()
  })

  test('should not show threshold needed when earned', () => {
    render(<BadgeCard badge={earnedBadge} />)
    expect(screen.queryByText(/needed/)).not.toBeInTheDocument()
  })

  test('should not apply opacity class when earned', () => {
    render(<BadgeCard badge={earnedBadge} />)
    expect(screen.getByTestId('generic-card').className).not.toContain(
      'opacity-60'
    )
  })
})

describe('BadgeCard in in-progress state', () => {
  test('renders without showLocked when in progress', () => {
    render(<BadgeCard badge={inProgressBadge} />)
    expect(screen.getByTestId('generic-card')).toBeInTheDocument()
  })

  test('should show progress percentage', () => {
    render(<BadgeCard badge={inProgressBadge} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  test('should show current value and threshold', () => {
    render(<BadgeCard badge={inProgressBadge} />)
    expect(screen.getByText(/0.5 \/ 1 kg/)).toBeInTheDocument()
  })

  test('should not show earned label when in progress', () => {
    render(<BadgeCard badge={inProgressBadge} />)
    expect(screen.queryByText(/Earned/)).not.toBeInTheDocument()
  })
})

describe('BadgeCard general rendering', () => {
  test('should render the badge title', () => {
    render(<BadgeCard badge={earnedBadge} />)
    expect(screen.getByText('First Step')).toBeInTheDocument()
  })

  test('should render tier pill label for bronze', () => {
    render(<BadgeCard badge={earnedBadge} />)
    expect(screen.getByText('Bronze')).toBeInTheDocument()
  })

  test('should render tier pill label for silver', () => {
    render(<BadgeCard badge={{ ...earnedBadge, tier: 2 }} />)
    expect(screen.getByText('Silver')).toBeInTheDocument()
  })

  test('should render tier pill label for gold', () => {
    render(<BadgeCard badge={{ ...earnedBadge, tier: 3 }} />)
    expect(screen.getByText('Gold')).toBeInTheDocument()
  })

  test('should default to bronze for unknown tier', () => {
    render(<BadgeCard badge={{ ...earnedBadge, tier: 99 }} showLocked />)
    expect(screen.getByText('Bronze')).toBeInTheDocument()
  })
})
