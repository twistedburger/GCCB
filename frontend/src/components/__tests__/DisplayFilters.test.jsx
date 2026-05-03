import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DisplayFilters from '../DisplayFilters'
import { displayFilterStrings } from '../../locales/en/ComponentStrings/DisplayFiltersStrings'

const DEFAULT_RADIUS = 2000

const baseFilters = {
  time: null,
  transportationModes: [],
  verifiedEventsOnly: false,
  mainEventsOnly: true,
  radius: DEFAULT_RADIUS,
}

describe('DisplayFilters Component', () => {
  it('renders nothing when all filters are default', () => {
    const { container } = render(
      <DisplayFilters
        filters={baseFilters}
        setFilters={jest.fn()}
        isArriving={false}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders time filter chip when time is set', () => {
    const filters = { ...baseFilters, time: '2026-05-15T08:00:00.000Z' } // UTC time
    render(
      <DisplayFilters
        filters={filters}
        setFilters={jest.fn()}
        isArriving={false}
      />
    )
    expect(screen.getByText('May 15, 1:00 AM')).toBeInTheDocument()
  })

  it('renders filter chips for selected transportationModes when transportationModes is set', () => {
    const filters = { ...baseFilters, transportationModes: ['Bus', 'Walk'] }
    render(
      <DisplayFilters
        filters={filters}
        setFilters={jest.fn()}
        isArriving={false}
      />
    )
    expect(screen.getByText('Bus, Walk')).toBeInTheDocument()
  })

  it('renders verified only filter chip when verifiedEventsOnly is true', () => {
    const filters = { ...baseFilters, verifiedEventsOnly: true }
    render(
      <DisplayFilters
        filters={filters}
        setFilters={jest.fn()}
        isArriving={false}
      />
    )
    expect(
      screen.getByText(displayFilterStrings.verifiedOnly)
    ).toBeInTheDocument()
  })

  // individual routes filter chip only renders when mainEventOnly = false and isArriving = true
  it('renders individual routes filter chip when mainEventsOnly is false and isArriving is true', () => {
    const filters = { ...baseFilters, mainEventsOnly: false }
    render(
      <DisplayFilters
        filters={filters}
        setFilters={jest.fn()}
        isArriving={true}
      />
    )
    expect(
      screen.getByText(displayFilterStrings.displayIndividualRoutes)
    ).toBeInTheDocument()
  })

  it('does not render individual routes filter chip when mainEventsOnly is false and isArriving is false', () => {
    const filters = { ...baseFilters, mainEventsOnly: false }
    render(
      <DisplayFilters
        filters={filters}
        setFilters={jest.fn()}
        isArriving={false}
      />
    )
    expect(
      screen.queryByText(displayFilterStrings.displayIndividualRoutes)
    ).not.toBeInTheDocument()
  })

  it('does not render individual routes filter chip when mainEventsOnly is true and isArriving is true', () => {
    const filters = { ...baseFilters, mainEventsOnly: true }
    render(
      <DisplayFilters
        filters={filters}
        setFilters={jest.fn()}
        isArriving={true}
      />
    )
    expect(
      screen.queryByText(displayFilterStrings.displayIndividualRoutes)
    ).not.toBeInTheDocument()
  })

  it('does not render individual routes filter chip when mainEventsOnly is true and isArriving is false', () => {
    const filters = { ...baseFilters, mainEventsOnly: true }
    render(
      <DisplayFilters
        filters={filters}
        setFilters={jest.fn()}
        isArriving={false}
      />
    )
    expect(
      screen.queryByText(displayFilterStrings.displayIndividualRoutes)
    ).not.toBeInTheDocument()
  })

  it('renders a filter chip when radius differs from default', () => {
    const filters = { ...baseFilters, radius: 1000 }
    render(
      <DisplayFilters
        filters={filters}
        setFilters={jest.fn()}
        isArriving={false}
      />
    )
    expect(screen.getByText('1000m')).toBeInTheDocument()
  })

  it('renders multiple chips when multiple filters are active', () => {
    const filters = {
      ...baseFilters,
      verifiedEventsOnly: true,
      radius: 1000,
      transportationModes: ['Bus'],
    }
    render(
      <DisplayFilters
        filters={filters}
        setFilters={jest.fn()}
        isArriving={false}
      />
    )
    expect(
      screen.getByText(displayFilterStrings.verifiedOnly)
    ).toBeInTheDocument()
    expect(screen.getByText('1000m')).toBeInTheDocument()
    expect(screen.getByText('Bus')).toBeInTheDocument()
  })

  it('each chip renders an ✕ icon', () => {
    const filters = { ...baseFilters, verifiedEventsOnly: true, radius: 1000 }
    render(
      <DisplayFilters
        filters={filters}
        setFilters={jest.fn()}
        isArriving={false}
      />
    )
    const dismissIcons = screen.getAllByText('✕')
    expect(dismissIcons).toHaveLength(2)
  })

  it('clicking on a filter chip calls setFilters', () => {
    const setFilters = jest.fn()
    const filters = { ...baseFilters, verifiedEventsOnly: true }
    render(
      <DisplayFilters
        filters={filters}
        setFilters={setFilters}
        isArriving={false}
      />
    )
    const filterChip = screen.getByText(displayFilterStrings.verifiedOnly)
    fireEvent.click(filterChip)
    expect(setFilters).toHaveBeenCalled()
  })
})
