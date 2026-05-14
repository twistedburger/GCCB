import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Badges from '../Badges'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
}))

/* eslint-disable react/prop-types, react/display-name */
jest.mock('../../../components/BadgeCard', () => ({ badge }) => (
  <div data-testid="badge-card">{badge.title}</div>
))

jest.mock(
  '../../../components/GenericButton',
  () =>
    ({ children, onClick, customStyling }) => (
      <button onClick={onClick} className={customStyling}>
        {children}
      </button>
    )
)

jest.mock(
  '@mui/icons-material',
  () =>
    new Proxy(
      {},
      { get: (_, name) => () => <div data-testid={`icon-${name}`} /> }
    )
)
/* eslint-enable react/prop-types */

jest.mock('../../../locales/en/AnalyticsStrings', () => ({
  analyticsStrings: { common: { back: 'Back' } },
}))

jest.mock('../../../locales/en/ComponentStrings/BadgeStrings', () => ({
  badgesStrings: {
    title: 'Badges',
    loading: 'Loading badges.',
    error: 'Failed to load badges.',
    earnedCount: (earned, total) => `${earned} of ${total} earned`,
    views: { all: 'All', earned: 'Earned', inProgress: 'In Progress' },
    categories: {
      eco_impact: 'Eco Impact',
      trips: 'Trip Milestones',
      modes: 'Mode Explorer',
      social: 'Social',
    },
    emptyEarned: 'Complete trips to start earning badges!',
    emptyProgress: 'No badges in progress yet.',
  },
}))

const mockBadges = [
  {
    id: 1,
    key: 'first_step',
    title: 'First Step',
    category: 'eco_impact',
    tier: 1,
    earned: true,
    dateEarned: '2026-05-01T00:00:00.000Z',
    currentValue: 1,
    progress: 1,
  },
  {
    id: 2,
    key: 'carbon_cutter',
    title: 'Carbon Cutter',
    category: 'eco_impact',
    tier: 1,
    earned: false,
    dateEarned: null,
    currentValue: 4.2,
    progress: 0.42,
  },
  {
    id: 3,
    key: 'first_ride',
    title: 'First Ride',
    category: 'trips',
    tier: 1,
    earned: true,
    dateEarned: '2026-04-01T00:00:00.000Z',
    currentValue: 1,
    progress: 1,
  },
]

function mockFetch({ ok = true, badges = mockBadges } = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve({ badges }),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => jest.restoreAllMocks())

describe('Badges on loading and error states', () => {
  test('should show loading state while fetching', async () => {
    global.fetch = jest.fn(() => new Promise(() => {}))
    render(<Badges />)
    expect(screen.getByText('Loading badges.')).toBeInTheDocument()
  })

  test('should show error message when fetch fails', async () => {
    mockFetch({ ok: false })
    await act(async () => render(<Badges />))
    expect(screen.getByText('Failed to load badges.')).toBeInTheDocument()
  })

  test('should show error message when fetch rejects', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    await act(async () => render(<Badges />))
    expect(screen.getByText('Failed to load badges.')).toBeInTheDocument()
  })
})

describe('Badges page on successful render', () => {
  test('should render page title', async () => {
    mockFetch()
    await act(async () => render(<Badges />))
    expect(screen.getByText('Badges')).toBeInTheDocument()
  })

  test('should render earned count after fetch', async () => {
    mockFetch()
    await act(async () => render(<Badges />))
    expect(screen.getByText('2 of 3 earned')).toBeInTheDocument()
  })

  test('should render back button', async () => {
    mockFetch()
    await act(async () => render(<Badges />))
    expect(screen.getByText('Back')).toBeInTheDocument()
  })

  test('should contain back button navigates to dashboard', async () => {
    mockFetch()
    await act(async () => render(<Badges />))
    fireEvent.click(screen.getByText('Back'))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  test('should render all three view toggle buttons', async () => {
    mockFetch()
    await act(async () => render(<Badges />))
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Earned')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })
})

describe('Badges in All view', () => {
  test('should render badge cards for all badges', async () => {
    mockFetch()
    await act(async () => render(<Badges />))
    expect(screen.getAllByTestId('badge-card')).toHaveLength(3)
  })

  test('should render category section headers', async () => {
    mockFetch()
    await act(async () => render(<Badges />))
    expect(screen.getByText('Eco Impact')).toBeInTheDocument()
    expect(screen.getByText('Trip Milestones')).toBeInTheDocument()
  })

  test('should not render section for empty category', async () => {
    mockFetch()
    await act(async () => render(<Badges />))
    expect(screen.queryByText('Mode Explorer')).not.toBeInTheDocument()
    expect(screen.queryByText('Social')).not.toBeInTheDocument()
  })
})

describe('Badges in Earned view', () => {
  test('should switch to Earned view on toggle click', async () => {
    mockFetch()
    await act(async () => render(<Badges />))
    fireEvent.click(screen.getByText('Earned'))
    expect(screen.getAllByTestId('badge-card')).toHaveLength(2)
  })

  test('should show an empty state when no badges earned', async () => {
    mockFetch({ badges: [{ ...mockBadges[1] }] })
    await act(async () => render(<Badges />))
    fireEvent.click(screen.getByText('Earned'))
    expect(
      screen.getByText('Complete trips to start earning badges!')
    ).toBeInTheDocument()
  })
})

describe('Badges in In-Progress view', () => {
  test('should switch to In Progress view on toggle click', async () => {
    mockFetch()
    await act(async () => render(<Badges />))
    fireEvent.click(screen.getByText('In Progress'))
    expect(screen.getAllByTestId('badge-card')).toHaveLength(1)
  })

  test('should show empty state when no badges in progress', async () => {
    mockFetch({ badges: [{ ...mockBadges[0] }] })
    await act(async () => render(<Badges />))
    fireEvent.click(screen.getByText('In Progress'))
    expect(screen.getByText('No badges in progress yet.')).toBeInTheDocument()
  })
})

describe('Badges when empty badge list', () => {
  test('should show 0 of 0 earned when no badges returned', async () => {
    mockFetch({ badges: [] })
    await act(async () => render(<Badges />))
    expect(screen.getByText('0 of 0 earned')).toBeInTheDocument()
  })

  test('should not show badge cards when list is empty', async () => {
    mockFetch({ badges: [] })
    await act(async () => render(<Badges />))
    expect(screen.queryAllByTestId('badge-card')).toHaveLength(0)
  })
})
