import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Commutes from '../Commutes'
import { analyticsStrings } from '../../../locales/en/AnalyticsStrings'

const commuteStrings = analyticsStrings.commutes

// mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// mock react-select
/* eslint-disable react/prop-types */
jest.mock(
  'react-select',
  () =>
    /**
     * Select replacement that renders a native <select> element.
     *
     * @param {Array} options Array of { value, label } option objects
     * @param {Object} value Currently selected { value, label } object
     * @param {Function} onChange Change handler called with selected option
     * @param {string} placeholder Placeholder text shown when no value selected
     */
    function MockSelect({ options, value, onChange, placeholder }) {
      return (
        <select
          data-testid="mock-select"
          value={value?.value ?? ''}
          onChange={e => {
            const selected = options.find(opt => opt.value === e.target.value)
            if (selected) onChange(selected)
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )
    }
)
/* eslint-enable react/prop-types */

// mock commute history
const mockHistoryData = {
  routes: [
    {
      id: 1,
      title: 'Morning Bus Commute',
      origin: 'Burnaby, BC',
      destination: 'Vancouver, BC',
      transportationMode: 'Bus',
      distance: 8.2,
      departTime: '2026-03-01T08:00:00Z',
      savedKgUser: 1.2,
      description: null,
    },
    {
      id: 2,
      title: 'Bike Ride',
      origin: 'Surrey, BC',
      destination: 'Burnaby, BC',
      transportationMode: 'Bicycle',
      distance: 14.5,
      departTime: '2026-03-05T07:30:00Z',
      savedKgUser: 2.5,
      description: 'Fun morning ride',
    },
  ],
}

// mock empty history response
const mockHistoryEmpty = { routes: [] }

/**
 * Sets up global.fetch to resolve with the given commute history data.
 * Accepts overrides for ok status and response body.
 *
 * @param {boolean} ok Whether the endpoint responds ok
 * @param {Object} data Mock commute history response body
 */
function mockFetch({ ok = true, data = mockHistoryData } = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  })
}

describe('Commutes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => jest.restoreAllMocks())

  // rendering tests

  test('renders back button', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // back button from common strings should be present
    expect(screen.getByText(analyticsStrings.common.back)).toBeInTheDocument()
  })

  test('back button navigates on click', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // simulate clicking back
    fireEvent.click(screen.getByText(analyticsStrings.common.back))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  test('renders page title and description', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // page title and description should be present
    expect(screen.getByText(commuteStrings.pageTitle)).toBeInTheDocument()
    expect(screen.getByText(commuteStrings.pageDescription)).toBeInTheDocument()
  })

  test('renders block titles', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // all three block titles should be visible
    expect(
      screen.getByText(commuteStrings.blocks.filters.title)
    ).toBeInTheDocument()
    expect(
      screen.getByText(commuteStrings.blocks.keyMetrics.title)
    ).toBeInTheDocument()
    expect(
      screen.getByText(commuteStrings.blocks.history.title)
    ).toBeInTheDocument()
  })

  test('renders filter labels', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // date range and mode filter labels should be visible
    expect(
      screen.getByText(commuteStrings.blocks.filters.dateRangeLabel)
    ).toBeInTheDocument()
    expect(
      screen.getByText(commuteStrings.blocks.filters.modeLabel)
    ).toBeInTheDocument()
  })

  // loading state tests

  test('shows "..." for KPI values while loading', () => {
    // do not resolve fetch — page stays in loading state
    global.fetch = jest.fn(() => new Promise(() => {}))
    render(<Commutes />)

    // all four KPI value slots should show placeholder
    const placeholders = screen.getAllByText('...')
    expect(placeholders.length).toBe(4)
  })

  test('shows loading text for history while loading', () => {
    global.fetch = jest.fn(() => new Promise(() => {}))
    render(<Commutes />)

    // loading text should be visible
    expect(
      screen.getByText(commuteStrings.blocks.history.loading)
    ).toBeInTheDocument()
  })

  // success state tests

  test('renders KPI labels after successful fetch', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // all four KPI labels should be present
    expect(screen.getByText(commuteStrings.kpis.trips)).toBeInTheDocument()
    expect(
      screen.getByText(commuteStrings.kpis.totalDistance)
    ).toBeInTheDocument()
    expect(
      screen.getByText(commuteStrings.kpis.avgDistance)
    ).toBeInTheDocument()
    expect(screen.getByText(commuteStrings.kpis.co2Saved)).toBeInTheDocument()
  })

  test('renders route cards after successful fetch', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // both route titles from mock data should be visible
    expect(screen.getByText('Morning Bus Commute')).toBeInTheDocument()
    expect(screen.getByText('Bike Ride')).toBeInTheDocument()
  })

  test('renders route origin and destination', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // origin and destination should be visible on the route cards
    expect(screen.getAllByText(/Burnaby, BC/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Vancouver, BC/).length).toBeGreaterThanOrEqual(
      1
    )
  })

  test('renders route description when present', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // second route has a description
    expect(screen.getByText('Fun morning ride')).toBeInTheDocument()
  })

  test('renders route field labels from locale', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // mode, distance and co2e field labels should be present
    expect(
      screen.getAllByText(`${commuteStrings.route.mode}:`).length
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getAllByText(`${commuteStrings.route.distance}:`).length
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getAllByText(`${commuteStrings.route.co2Saved}:`).length
    ).toBeGreaterThanOrEqual(1)
  })

  test('renders KPI values based on filtered routes', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // 2 routes in mock data
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  // empty state tests

  test('shows empty state when no routes returned', async () => {
    mockFetch({ data: mockHistoryEmpty })
    await act(async () => render(<Commutes />))

    // empty state message should appear
    expect(
      screen.getByText(commuteStrings.blocks.history.empty)
    ).toBeInTheDocument()
  })

  test('shows untitled fallback when route has no title', async () => {
    mockFetch({
      data: {
        routes: [
          {
            id: 3,
            title: null,
            origin: 'A',
            destination: 'B',
            transportationMode: 'Bus',
            distance: 5.0,
            departTime: '2026-03-10T08:00:00Z',
            savedKgUser: 0.8,
          },
        ],
      },
    })
    await act(async () => render(<Commutes />))

    // untitled fallback string from locale should appear
    expect(
      screen.getByText(commuteStrings.blocks.history.untitled)
    ).toBeInTheDocument()
  })

  // filter tests

  test('filters routes by mode selection', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // both routes visible before filtering
    expect(screen.getByText('Morning Bus Commute')).toBeInTheDocument()
    expect(screen.getByText('Bike Ride')).toBeInTheDocument()

    // select the mode filter (second mock-select is the mode dropdown)
    const selects = screen.getAllByTestId('mock-select')
    fireEvent.change(selects[1], { target: { value: 'bus' } })

    // only bus route should remain
    expect(screen.getByText('Morning Bus Commute')).toBeInTheDocument()
    expect(screen.queryByText('Bike Ride')).not.toBeInTheDocument()
  })

  test('shows empty state when filter matches no routes', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // select rail where no routes use rail in mock data
    const selects = screen.getAllByTestId('mock-select')
    fireEvent.change(selects[1], { target: { value: 'rail' } })

    // empty state should appear
    expect(
      screen.getByText(commuteStrings.blocks.history.empty)
    ).toBeInTheDocument()
  })

  // error state tests

  test('shows error message when fetch fails', async () => {
    mockFetch({ ok: false })
    await act(async () => render(<Commutes />))

    // error message should appear
    expect(
      screen.getByText('Failed to load commute history.')
    ).toBeInTheDocument()
  })

  // fetch call tests

  test('fetches commute history on mount', async () => {
    mockFetch()
    await act(async () => render(<Commutes />))

    // commute history endpoint should have been called
    expect(fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_BASE_URL}/api/commute-history`,
      { credentials: 'include' }
    )
  })
})
