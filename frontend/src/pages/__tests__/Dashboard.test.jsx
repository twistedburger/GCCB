import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Dashboard from '../Dashboard'
import { analyticsStrings } from '../../locales/en/AnalyticsStrings'

const dashboardStrings = analyticsStrings.dashboard

// mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// mock UserContext
const mockSetUser = jest.fn()
const mockUser = {
  name: 'Jamie Kim',
  nickname: 'justJam',
  role: 'user',
  description: 'Test user description.',
}

jest.mock('../../../context/UserContext', () => ({
  useUser: jest.fn(),
}))

// mock ProfileForm
/* eslint-disable react/prop-types */
jest.mock(
  '../../components/ProfileForm',
  () =>
    /**
     * ProfileForm replacement for testing.
     * Renders a cancel button so we can test close behaviour.
     *
     * @param {Function} onCancel Callback when cancel is clicked
     */
    function MockProfileForm({ onCancel }) {
      return (
        <div data-testid="profile-form">
          <button onClick={onCancel}>Cancel</button>
        </div>
      )
    }
)
/* eslint-enable react/prop-types */

// mock summary data
const mockSummaryUser = {
  scope: 'user',
  tripCount: 4,
  totalDistanceKm: 26.6,
  totalCo2SavedKg: 4.03,
  tripFrequenciesByMode: {
    walk: 1,
    bicycle: 2,
    bus: 1,
    rail: 0,
    car: 0,
  },
}

const mockSummaryAdmin = {
  scope: 'system',
  tripCount: 20,
  totalDistanceKm: 180.0,
  totalCo2SavedKg: 28.4,
  tripFrequenciesByMode: {
    walk: 2,
    bicycle: 10,
    bus: 8,
    rail: 0,
    car: 0,
  },
}

/**
 * Sets up global.fetch to respond with the given summary data.
 * Accepts overrides for ok status and response body.
 *
 * @param {boolean} ok Whether the summary endpoint responds ok
 * @param {Object} data Mock summary response body
 */
function mockFetch({ ok = true, data = mockSummaryUser } = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  })
}

/**
 * Configures the useUser mock
 *
 * @param {Object|null} user The user object to return
 * @param {boolean} loadingUser Whether the user is still loading
 * @param {string} userError Error message if user fetch failed
 */
function setupUserContext({
  user = mockUser,
  loadingUser = false,
  userError = '',
} = {}) {
  const { useUser } = require('../../../context/UserContext')
  useUser.mockReturnValue({
    user,
    loadingUser,
    userError,
    setUser: mockSetUser,
  })
}

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupUserContext()
  })

  afterEach(() => jest.restoreAllMocks())

  // rendering tests

  test('renders page title and welcome from locale', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    // title and welcome text should be present
    expect(screen.getByText(dashboardStrings.title)).toBeInTheDocument()
    expect(screen.getByText(dashboardStrings.welcome)).toBeInTheDocument()
  })

  test('renders logout button', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    expect(screen.getByText(dashboardStrings.logout)).toBeInTheDocument()
  })

  test('renders metric cards hint text', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    expect(
      screen.getByText(dashboardStrings.metricCardsHint)
    ).toBeInTheDocument()
  })

  // profile loading states

  test('shows loading profile text while user is loading', async () => {
    mockFetch()
    setupUserContext({ user: null, loadingUser: true })
    await act(async () => render(<Dashboard />))

    expect(
      screen.getByText(dashboardStrings.loadingProfile)
    ).toBeInTheDocument()
  })

  test('shows user error when user fetch fails', async () => {
    mockFetch()
    setupUserContext({ user: null, userError: 'Failed to load user.' })
    await act(async () => render(<Dashboard />))

    expect(screen.getByText('Failed to load user.')).toBeInTheDocument()
  })

  // profile header tests

  test('renders user name and nickname in profile header', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    // name and nickname should be visible
    expect(screen.getByText('Jamie Kim')).toBeInTheDocument()
    expect(screen.getByText('(justJam)')).toBeInTheDocument()
  })

  test('renders user role in profile header', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    expect(screen.getByText('user')).toBeInTheDocument()
  })

  test('renders user description in profile header', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    expect(screen.getByText('Test user description.')).toBeInTheDocument()
  })

  test('renders edit profile button', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
  })

  test('shows profile form when edit profile is clicked', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    fireEvent.click(screen.getByText('Edit Profile'))

    // profile form mock should now be rendered
    expect(screen.getByTestId('profile-form')).toBeInTheDocument()
  })

  test('hides profile form when cancel is clicked', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    fireEvent.click(screen.getByText('Edit Profile'))
    fireEvent.click(screen.getByText('Cancel'))

    // profile form should be gone
    expect(screen.queryByTestId('profile-form')).not.toBeInTheDocument()
  })

  // user metric cards tests

  test('renders user metric card titles', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    // user scope shows these three card titles plus badges
    expect(screen.getByText('Total Trips')).toBeInTheDocument()
    expect(screen.getByText('Personal CO₂ Saved')).toBeInTheDocument()
    expect(screen.getByText('Most Used Mode')).toBeInTheDocument()
    expect(screen.getByText('Badges')).toBeInTheDocument()
  })

  test('renders user metric card values after successful fetch', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    // trip count and co2 values from mock data
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('4.03 kg')).toBeInTheDocument()
  })

  test('renders most used mode from trip frequencies', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    // bicycle has highest frequency in mockSummaryUser
    expect(screen.getByText('Bicycle')).toBeInTheDocument()
  })

  // admin metric cards tests

  test('renders admin metric card titles when scope is system', async () => {
    mockFetch({ data: mockSummaryAdmin })
    setupUserContext({ user: { ...mockUser, role: 'admin' } })
    await act(async () => render(<Dashboard />))

    // admin scope shows these three card titles
    expect(screen.getByText('Total User Trips')).toBeInTheDocument()
    expect(screen.getByText('Total CO₂e Saved')).toBeInTheDocument()
    expect(screen.getByText('Platform Activity')).toBeInTheDocument()
  })

  // loading state tests

  test('shows "..." for metric card values while loading', () => {
    // do not resolve fetch and page stays in loading state
    global.fetch = jest.fn(() => new Promise(() => {}))
    render(<Dashboard />)

    const placeholders = screen.getAllByText('...')
    expect(placeholders.length).toBeGreaterThanOrEqual(1)
  })

  // error state tests

  test('shows summary error when analytics fetch fails', async () => {
    mockFetch({ ok: false })
    await act(async () => render(<Dashboard />))

    expect(
      screen.getByText('Failed to load analytics summary.')
    ).toBeInTheDocument()
  })

  // navigation tests

  test('clicking Total Trips card navigates to commutes', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    fireEvent.click(screen.getByText('Total Trips').closest('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/commutes')
  })

  test('clicking Personal CO₂ Saved card navigates to co2-savings', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    fireEvent.click(screen.getByText('Personal CO₂ Saved').closest('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/co2-savings')
  })

  test('clicking Most Used Mode card navigates to trip-frequency', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    fireEvent.click(screen.getByText('Most Used Mode').closest('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/trip-frequency')
  })

  // fetch call tests

  test('fetches analytics summary on mount', async () => {
    mockFetch()
    await act(async () => render(<Dashboard />))

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/analytics/summary',
      { credentials: 'include' }
    )
  })
})
