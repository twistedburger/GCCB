import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Co2Savings from '../Co2Savings'
import { analyticsStrings } from '../../../locales/en/AnalyticsStrings'

const co2Strings = analyticsStrings.co2

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

// mock icons used by Modal close button
jest.mock('@mui/icons-material', () => ({
  Close: () => <div data-testid="close-icon" />,
}))
/* eslint-enable react/prop-types */

// mock summary for user scope
const mockSummaryUser = {
  scope: 'user',
  tripCount: 4,
  totalDistanceKm: 32.5,
  totalCo2SavedKg: 5.6,
}

// mock summary for admin scope
const mockSummaryAdmin = {
  scope: 'system',
  tripCount: 20,
  totalDistanceKm: 180.0,
  totalCo2SavedKg: 28.4,
}

// mock by-mode response with data
const mockByModeData = {
  data: [
    {
      mode: 'bus',
      tripCount: 3,
      totalDistanceKm: 24.0,
      totalCo2SavedKg: 4.2,
    },
    {
      mode: 'bicycle',
      tripCount: 1,
      totalDistanceKm: 8.5,
      totalCo2SavedKg: 1.4,
    },
  ],
}

// mock by-mode response with no usable data
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

describe('Co2Savings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => jest.restoreAllMocks())

  // rendering tests

  test('renders back button', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    // back button from common strings should be present
    expect(screen.getByText(analyticsStrings.common.back)).toBeInTheDocument()
  })

  test('back button navigates on click', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    // simulate clicking back
    fireEvent.click(screen.getByText(analyticsStrings.common.back))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  test('renders user page title when scope is user', async () => {
    mockFetchByUrl({ summaryData: mockSummaryUser })
    await act(async () => render(<Co2Savings />))

    // user scope shows personal title
    expect(screen.getByText(co2Strings.pageTitle.user)).toBeInTheDocument()
  })

  test('renders admin page title when scope is system', async () => {
    mockFetchByUrl({ summaryData: mockSummaryAdmin })
    await act(async () => render(<Co2Savings />))

    // admin scope shows community title
    expect(screen.getByText(co2Strings.pageTitle.admin)).toBeInTheDocument()
  })

  test('renders how is this calculated button', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    // methodology button should be present
    expect(screen.getByText(co2Strings.howCalculated)).toBeInTheDocument()
  })

  test('renders disclaimer text', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    // estimates disclaimer should be visible
    expect(screen.getByText(co2Strings.disclaimer)).toBeInTheDocument()
  })

  test('renders block titles', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    // both analytics block titles should be present
    expect(
      screen.getByText(co2Strings.blocks.keyMetrics.title)
    ).toBeInTheDocument()
    expect(
      screen.getByText(co2Strings.blocks.overview.title)
    ).toBeInTheDocument()
  })

  // loading state tests

  test('shows "..." for KPI values while loading', () => {
    // do not resolve fetch and page stays in loading state
    global.fetch = jest.fn(() => new Promise(() => {}))
    render(<Co2Savings />)

    // all four KPI value slots should show placeholder
    const placeholders = screen.getAllByText('...')
    expect(placeholders.length).toBe(4)
  })

  test('shows loading text for charts while loading', () => {
    global.fetch = jest.fn(() => new Promise(() => {}))
    render(<Co2Savings />)

    // loading text from common strings should be visible
    expect(
      screen.getByText(analyticsStrings.common.loadingCharts)
    ).toBeInTheDocument()
  })

  // success state tests

  test('renders user KPI labels after successful fetch', async () => {
    mockFetchByUrl({ summaryData: mockSummaryUser })
    await act(async () => render(<Co2Savings />))

    // user scope shows personal KPI labels
    expect(screen.getByText(co2Strings.kpis.personalSaved)).toBeInTheDocument()
    expect(screen.getByText(co2Strings.kpis.avgPerTrip)).toBeInTheDocument()
    expect(screen.getByText(co2Strings.kpis.tripsIncluded)).toBeInTheDocument()
    expect(
      screen.getByText(co2Strings.kpis.distanceIncluded)
    ).toBeInTheDocument()
  })

  test('renders admin KPI labels after successful fetch', async () => {
    mockFetchByUrl({ summaryData: mockSummaryAdmin })
    await act(async () => render(<Co2Savings />))

    // admin scope shows community KPI label
    expect(screen.getByText(co2Strings.kpis.communitySaved)).toBeInTheDocument()
  })

  test('renders formatted KPI values after successful fetch', async () => {
    mockFetchByUrl({ summaryData: mockSummaryUser })
    await act(async () => render(<Co2Savings />))

    // trip count and formatted CO2/distance values should appear
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5.60 kg')).toBeInTheDocument()
    expect(screen.getByText('32.50 km')).toBeInTheDocument()
  })

  test('renders two bar charts when data is present', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    // co2e by mode and efficiency charts should both render
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2)
  })

  test('renders chart card titles when data is present', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    // both chart titles should be present
    expect(screen.getByText(co2Strings.charts.byMode.title)).toBeInTheDocument()
    expect(
      screen.getByText(co2Strings.charts.efficiency.title)
    ).toBeInTheDocument()
  })

  // empty state tests

  test('shows empty state when no chart data', async () => {
    mockFetchByUrl({ byModeData: mockByModeEmpty })
    await act(async () => render(<Co2Savings />))

    // empty state message from common strings should appear
    expect(screen.getByText(analyticsStrings.common.noData)).toBeInTheDocument()
  })

  // error state tests

  test('shows error message when summary fetch fails', async () => {
    mockFetchByUrl({ summaryOk: false })
    await act(async () => render(<Co2Savings />))

    // error message should appear
    expect(
      screen.getByText('Failed to load CO₂e analytics.')
    ).toBeInTheDocument()
  })

  test('shows error message when by-mode fetch fails', async () => {
    mockFetchByUrl({ byModeOk: false })
    await act(async () => render(<Co2Savings />))

    // error message should appear
    expect(
      screen.getByText('Failed to load CO₂e analytics.')
    ).toBeInTheDocument()
  })

  // modal tests

  test('methodology modal is not visible by default', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    // modal title should not be in the document when closed
    expect(screen.queryByText(co2Strings.modal.title)).not.toBeInTheDocument()
  })

  test('opens methodology modal when button is clicked', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    // click the how is this calculated button
    fireEvent.click(screen.getByText(co2Strings.howCalculated))

    // modal title should now be visible
    expect(screen.getByText(co2Strings.modal.title)).toBeInTheDocument()
  })

  test('modal contains baseline section heading and factor', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    fireEvent.click(screen.getByText(co2Strings.howCalculated))

    // baseline heading and body text should be visible
    expect(
      screen.getByText(co2Strings.modal.baseline.heading)
    ).toBeInTheDocument()
    expect(screen.getByText(co2Strings.modal.baseline.body)).toBeInTheDocument()
  })

  test('modal contains emission factors table columns', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    fireEvent.click(screen.getByText(co2Strings.howCalculated))

    // table column headers should be present
    expect(
      screen.getByText(co2Strings.modal.emissionFactors.columns.mode)
    ).toBeInTheDocument()
    expect(
      screen.getByText(co2Strings.modal.emissionFactors.columns.factor)
    ).toBeInTheDocument()
    expect(
      screen.getByText(co2Strings.modal.emissionFactors.columns.basis)
    ).toBeInTheDocument()
  })

  test('modal contains savings formula section', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    fireEvent.click(screen.getByText(co2Strings.howCalculated))

    // formulas heading and walk formula label appear and walk label also exists in the table
    expect(
      screen.getByText(co2Strings.modal.formulas.heading)
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(co2Strings.modal.formulas.walk.label).length
    ).toBeGreaterThanOrEqual(1)
  })

  test('closes methodology modal when close button is clicked', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

    // open the modal
    fireEvent.click(screen.getByText(co2Strings.howCalculated))
    expect(screen.getByText(co2Strings.modal.title)).toBeInTheDocument()

    // close the modal via the close icon button
    fireEvent.click(screen.getByTestId('close-icon').closest('button'))

    // modal title should no longer be in the document
    expect(screen.queryByText(co2Strings.modal.title)).not.toBeInTheDocument()
  })

  // fetch call tests

  test('fetches summary and by-mode on mount', async () => {
    mockFetchByUrl()
    await act(async () => render(<Co2Savings />))

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
