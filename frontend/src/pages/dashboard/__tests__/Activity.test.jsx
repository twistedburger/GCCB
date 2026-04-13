import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Activity from '../Activity'
import { analyticsStrings } from '../../../locales/en/AnalyticsStrings'

const activityStrings = analyticsStrings.activity

// mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// mock recharts
/* eslint-disable react/prop-types */
jest.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Bar: () => <div />,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}))
/* eslint-enable react/prop-types */

// mock data
const mockSummaryData = {
  kpis: {
    activeCreators7d: 5,
    completionRate30d: 80,
    rejectedRoutes30d: 2,
    avgGroupSize: 3.5,
  },
  statusBreakdown: {
    upcoming: 10,
    completed: 40,
    rejected: 2,
  },
  rejectionReasons: [{ reason: 'Inappropriate content', count: 2 }],
}

const mockTimeseriesData = {
  data: [
    { period: '2026-01-01', baselineKg: 10, actualKg: 4, savedKg: 6 },
    { period: '2026-01-02', baselineKg: 12, actualKg: 5, savedKg: 7 },
  ],
}

const mockEmptyTimeseriesData = { data: [] }

/**
 * Sets up global.fetch to respond based on the URL being requested.
 * Accepts overrides for ok status and response bodies.
 *
 * @param {boolean} summaryOk Whether the summary endpoint responds ok
 * @param {boolean} timeseriesOk Whether the timeseries endpoint responds ok
 * @param {Object} timeseriesData Mock timeseries response body
 */
function mockFetchByUrl({
  summaryOk = true,
  timeseriesOk = true,
  timeseriesData = mockTimeseriesData,
} = {}) {
  global.fetch = jest.fn().mockImplementation(url => {
    if (url.includes('/api/activity/summary')) {
      return Promise.resolve({
        ok: summaryOk,
        json: () => Promise.resolve(mockSummaryData),
      })
    }
    if (url.includes('/api/activity/co2-timeseries')) {
      return Promise.resolve({
        ok: timeseriesOk,
        json: () => Promise.resolve(timeseriesData),
      })
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`))
  })
}

describe('Activity', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => jest.restoreAllMocks())

  // rendering tests

  test('renders page title and description', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // confirm page title and description from locale
    expect(screen.getByText(activityStrings.pageTitle)).toBeInTheDocument()
    expect(
      screen.getByText(activityStrings.pageDescription)
    ).toBeInTheDocument()
  })

  test('renders back button', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // confirm back button is rendered
    expect(screen.getByText(analyticsStrings.common.back)).toBeInTheDocument()
  })

  test('back button navigates on click', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // simulate clicking back
    fireEvent.click(screen.getByText(analyticsStrings.common.back))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  test('renders KPI labels from locale', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // confirm all four KPI labels are present
    expect(
      screen.getByText(activityStrings.kpis.activeCreators7d)
    ).toBeInTheDocument()
    expect(
      screen.getByText(activityStrings.kpis.completionRate30d)
    ).toBeInTheDocument()
    expect(
      screen.getByText(activityStrings.kpis.rejectedRoutes30d)
    ).toBeInTheDocument()
    expect(
      screen.getByText(activityStrings.kpis.avgGroupSize)
    ).toBeInTheDocument()
  })

  test('renders KPI subvalues from locale', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // confirm subvalue labels are rendered
    expect(
      screen.getByText(activityStrings.kpis.activeCreators7dSub)
    ).toBeInTheDocument()
    expect(
      screen.getByText(activityStrings.kpis.completionRate30dSub)
    ).toBeInTheDocument()
  })

  test('renders block titles from locale', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // confirm section headings are present
    expect(
      screen.getByText(activityStrings.blocks.atAGlance.title)
    ).toBeInTheDocument()
    expect(
      screen.getByText(activityStrings.blocks.statusBreakdown.title)
    ).toBeInTheDocument()
    expect(
      screen.getByText(activityStrings.blocks.co2OverTime.title)
    ).toBeInTheDocument()
  })

  // loading state tests

  test('shows "..." for KPI values while loading', () => {
    // do not resolve fetch and page stays in loading state
    global.fetch = jest.fn(() => new Promise(() => {}))
    render(<Activity />)

    // all four KPI value slots should show placeholder
    const placeholders = screen.getAllByText('...')
    expect(placeholders.length).toBe(4)
  })

  test('shows loading text for status breakdown while loading', () => {
    global.fetch = jest.fn(() => new Promise(() => {}))
    render(<Activity />)

    // loading message from locale should be visible
    expect(
      screen.getByText(activityStrings.blocks.statusBreakdown.loading)
    ).toBeInTheDocument()
  })

  // success state tests

  test('renders KPI values after successful fetch', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // confirm KPI values from mock data are displayed
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3.5')).toBeInTheDocument()
  })

  test('renders status breakdown chart after successful fetch', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // status breakdown chart card title should be visible
    expect(
      screen.getByText(activityStrings.charts.statusBreakdown.title)
    ).toBeInTheDocument()
    // two bar charts render status breakdown and rejection reasons
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2)
  })

  test('renders rejection reasons chart when rejection data is present', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // rejection chart title and reason from mock data should be present
    expect(
      screen.getByText(activityStrings.charts.rejectionReasons.title)
    ).toBeInTheDocument()
  })

  test('shows empty state when no rejection reasons', async () => {
    // override summary to return empty rejection reasons
    global.fetch = jest.fn().mockImplementation(url => {
      if (url.includes('/api/activity/summary')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ ...mockSummaryData, rejectionReasons: [] }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEmptyTimeseriesData),
      })
    })

    await act(async () => render(<Activity />))

    // empty state text from locale should be shown
    expect(
      screen.getByText(activityStrings.charts.rejectionReasons.empty)
    ).toBeInTheDocument()
  })

  // error state tests

  test('shows error message when summary fetch fails', async () => {
    mockFetchByUrl({ summaryOk: false })
    await act(async () => render(<Activity />))

    // error message should appear
    expect(
      screen.getByText('Failed to load activity data.')
    ).toBeInTheDocument()
  })

  // timeseries tests

  test('shows timeseries empty state when no data', async () => {
    mockFetchByUrl({ timeseriesData: mockEmptyTimeseriesData })
    await act(async () => render(<Activity />))

    // empty state from locale should be shown
    expect(
      screen.getByText(activityStrings.charts.timeseries.empty)
    ).toBeInTheDocument()
  })

  test('renders timeseries chart when data is present', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // line chart should be rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  test('renders timeseries chart title from locale', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    expect(
      screen.getByText(activityStrings.charts.timeseries.title)
    ).toBeInTheDocument()
  })

  // granularity toggle tests

  test('renders all three granularity buttons', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // all three toggle buttons should be present
    expect(screen.getByText('daily')).toBeInTheDocument()
    expect(screen.getByText('monthly')).toBeInTheDocument()
    expect(screen.getByText('quarterly')).toBeInTheDocument()
  })

  test('daily granularity button is active by default', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // daily button should have the active class
    const dailyButton = screen.getByText('daily')
    expect(dailyButton).toHaveClass('bg-blue-primary')
  })

  test('clicking monthly granularity makes it active', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // click the monthly button
    fireEvent.click(screen.getByText('monthly'))

    // monthly should now be active, daily should not
    expect(screen.getByText('monthly')).toHaveClass('bg-blue-primary')
    expect(screen.getByText('daily')).not.toHaveClass('bg-blue-primary')
  })

  test('clicking quarterly granularity makes it active', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // click the quarterly button
    fireEvent.click(screen.getByText('quarterly'))

    expect(screen.getByText('quarterly')).toHaveClass('bg-blue-primary')
    expect(screen.getByText('daily')).not.toHaveClass('bg-blue-primary')
  })

  // fetch call tests

  test('fetches activity summary on mount', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // confirm the summary endpoint was called
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/activity/summary',
      { credentials: 'include' }
    )
  })

  test('fetches all three timeseries granularities on mount', async () => {
    mockFetchByUrl()
    await act(async () => render(<Activity />))

    // confirm all three granularity endpoints were called
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/activity/co2-timeseries?granularity=daily',
      { credentials: 'include' }
    )
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/activity/co2-timeseries?granularity=monthly',
      { credentials: 'include' }
    )
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/activity/co2-timeseries?granularity=quarterly',
      { credentials: 'include' }
    )
  })
})
