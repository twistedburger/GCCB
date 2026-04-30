import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import TripFrequency from '../TripFrequency'
import { analyticsStrings } from '../../../locales/en/AnalyticsStrings'

const tripStrings = analyticsStrings.tripFrequency

// mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// mock recharts
/* eslint-disable react/prop-types */
jest.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}))
/* eslint-enable react/prop-types */

// mock summary for user scope
const mockSummaryUser = {
  scope: 'user',
  tripCount: 6,
  totalDistanceKm: 48.0,
  tripFrequenciesByMode: {
    walk: 1,
    bicycle: 4,
    bus: 1,
    rail: 0,
    car: 0,
    other: 0,
  },
}

// mock summary for admin scope
const mockSummaryAdmin = {
  scope: 'system',
  tripCount: 40,
  totalDistanceKm: 320.0,
  tripFrequenciesByMode: {
    walk: 5,
    bicycle: 20,
    bus: 10,
    rail: 5,
    car: 0,
    other: 0,
  },
}

// mock by-mode response with data
const mockByModeData = {
  data: [
    {
      mode: 'bicycle',
      tripCount: 4,
      totalDistanceKm: 32.0,
      totalCo2SavedKg: 5.4,
    },
    {
      mode: 'bus',
      tripCount: 1,
      totalDistanceKm: 8.0,
      totalCo2SavedKg: 0.6,
    },
  ],
}

// mock by-mode with no usable data
const mockByModeEmpty = { data: [] }

/**
 * Sets up global.fetch to respond based on the URL being requested.
 * Accepts overrides for ok status and response bodies.
 *
 * @param {boolean} summaryOk Whether the summary endpoint responds ok
 * @param {boolean} byModeOk Whether the by-mode endpoint responds ok
 * @param {Object} summaryData Mock summary response body
 * @param {Object} byModeData Mock by-mode response body
 */
function mockFetchByUrl({
  summaryOk = true,
  byModeOk = true,
  summaryData = mockSummaryUser,
  byModeData = mockByModeData,
} = {}) {
  global.fetch = jest.fn().mockImplementation(url => {
    if (url.includes('/api/analytics/summary')) {
      return Promise.resolve({
        ok: summaryOk,
        json: () => Promise.resolve(summaryData),
      })
    }
    if (url.includes('/api/analytics/by-mode')) {
      return Promise.resolve({
        ok: byModeOk,
        json: () => Promise.resolve(byModeData),
      })
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`))
  })
}

describe('TripFrequency', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => jest.restoreAllMocks())

  // rendering tests

  test('renders back button', async () => {
    mockFetchByUrl()
    await act(async () => render(<TripFrequency />))

    // back button from common strings should be present
    expect(screen.getByText(analyticsStrings.common.back)).toBeInTheDocument()
  })

  test('back button navigates on click', async () => {
    mockFetchByUrl()
    await act(async () => render(<TripFrequency />))

    // simulate clicking back
    fireEvent.click(screen.getByText(analyticsStrings.common.back))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  test('renders user page title when scope is user', async () => {
    mockFetchByUrl({ summaryData: mockSummaryUser })
    await act(async () => render(<TripFrequency />))

    // user scope shows personal title
    expect(screen.getByText(tripStrings.pageTitle.user)).toBeInTheDocument()
  })

  test('renders admin page title when scope is system', async () => {
    mockFetchByUrl({ summaryData: mockSummaryAdmin })
    await act(async () => render(<TripFrequency />))

    // admin scope shows community title
    expect(screen.getByText(tripStrings.pageTitle.admin)).toBeInTheDocument()
  })

  test('renders all block titles', async () => {
    mockFetchByUrl()
    await act(async () => render(<TripFrequency />))

    // all three block titles should be present
    expect(
      screen.getByText(tripStrings.blocks.atAGlance.title)
    ).toBeInTheDocument()
    expect(
      screen.getByText(tripStrings.blocks.byMode.title)
    ).toBeInTheDocument()
    expect(
      screen.getByText(tripStrings.blocks.whyItMatters.title)
    ).toBeInTheDocument()
  })

  // loading state tests

  test('shows "..." for KPI values while loading', () => {
    // do not resolve fetch and page stays in loading state
    global.fetch = jest.fn(() => new Promise(() => {}))
    render(<TripFrequency />)

    // all three KPI value slots should show placeholder
    const placeholders = screen.getAllByText('...')
    expect(placeholders.length).toBe(3)
  })

  test('shows loading text for charts while loading', () => {
    global.fetch = jest.fn(() => new Promise(() => {}))
    render(<TripFrequency />)

    // loading text from common strings should be visible
    expect(
      screen.getByText(analyticsStrings.common.loadingCharts)
    ).toBeInTheDocument()
  })

  // success state tests

  test('renders user KPI labels after successful fetch', async () => {
    mockFetchByUrl({ summaryData: mockSummaryUser })
    await act(async () => render(<TripFrequency />))

    // user scope shows personal KPI labels
    expect(screen.getByText(tripStrings.kpis.mostUsedMode)).toBeInTheDocument()
    expect(screen.getByText(tripStrings.kpis.totalTrips)).toBeInTheDocument()
    expect(screen.getByText(tripStrings.kpis.totalDistance)).toBeInTheDocument()
  })

  test('renders admin KPI labels after successful fetch', async () => {
    mockFetchByUrl({ summaryData: mockSummaryAdmin })
    await act(async () => render(<TripFrequency />))

    // admin scope shows community KPI labels
    expect(
      screen.getByText(tripStrings.kpis.communityTrips)
    ).toBeInTheDocument()
    expect(
      screen.getByText(tripStrings.kpis.communityDistance)
    ).toBeInTheDocument()
  })

  test('renders KPI values after successful fetch', async () => {
    mockFetchByUrl({ summaryData: mockSummaryUser })
    await act(async () => render(<TripFrequency />))

    // trip count and distance should be visible
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('48.00 km')).toBeInTheDocument()
  })

  test('renders most used mode from trip frequencies', async () => {
    mockFetchByUrl({ summaryData: mockSummaryUser })
    await act(async () => render(<TripFrequency />))

    // bicycle has the highest frequency in mockSummaryUser
    expect(screen.getByText('Bicycle')).toBeInTheDocument()
  })

  test('renders two bar charts when data is present', async () => {
    mockFetchByUrl()
    await act(async () => render(<TripFrequency />))

    // trips by mode and avg distance charts should both render
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2)
  })

  test('renders chart card titles when data is present', async () => {
    mockFetchByUrl()
    await act(async () => render(<TripFrequency />))

    // both chart titles should be visible
    expect(
      screen.getByText(tripStrings.charts.byMode.title)
    ).toBeInTheDocument()
    expect(
      screen.getByText(tripStrings.charts.avgDistance.title)
    ).toBeInTheDocument()
  })

  test('renders why it matters body for user scope', async () => {
    mockFetchByUrl({ summaryData: mockSummaryUser })
    await act(async () => render(<TripFrequency />))

    // user body text should be visible
    expect(
      screen.getByText(tripStrings.blocks.whyItMatters.bodyUser)
    ).toBeInTheDocument()
  })

  test('renders why it matters body for admin scope', async () => {
    mockFetchByUrl({ summaryData: mockSummaryAdmin })
    await act(async () => render(<TripFrequency />))

    // admin body text should be visible
    expect(
      screen.getByText(tripStrings.blocks.whyItMatters.bodyAdmin)
    ).toBeInTheDocument()
  })

  test('renders why it matters footnote', async () => {
    mockFetchByUrl()
    await act(async () => render(<TripFrequency />))

    expect(
      screen.getByText(tripStrings.blocks.whyItMatters.footnote)
    ).toBeInTheDocument()
  })

  // empty state tests

  test('shows empty state when no chart data', async () => {
    mockFetchByUrl({ byModeData: mockByModeEmpty })
    await act(async () => render(<TripFrequency />))

    // empty state message from common strings should appear
    expect(screen.getByText(analyticsStrings.common.noData)).toBeInTheDocument()
  })

  // error state tests

  test('shows error message when fetch fails', async () => {
    mockFetchByUrl({ summaryOk: false })
    await act(async () => render(<TripFrequency />))

    // error message should appear
    expect(
      screen.getByText('Failed to load trip frequency analytics.')
    ).toBeInTheDocument()
  })

  // fetch call tests

  test('fetches summary and by-mode on mount', async () => {
    mockFetchByUrl()
    await act(async () => render(<TripFrequency />))

    // both endpoints should have been called on mount
    expect(fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_BASE_URL}/api/analytics/summary`,
      { credentials: 'include' }
    )
    expect(fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_BASE_URL}/api/analytics/by-mode`,
      { credentials: 'include' }
    )
  })
})
