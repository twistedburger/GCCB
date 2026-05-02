import { render, screen, fireEvent, act, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import MyTrips from '../MyTrips'
import { myTripsStrings } from '../../locales/en/MyTripsStrings'
import { routeCardStrings as routeStrings } from '../../locales/en/ComponentStrings/RouteCardStrings'
import {
  fetchMyTrips,
  confirmTripAction,
  leaveRoute,
} from '../../utils/myTripsUtils'

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ isJoined: true }),
})

jest.mock('../../utils/myTripsUtils', () => ({
  ...jest.requireActual('../../utils/myTripsUtils'),
  fetchMyTrips: jest.fn(),
  confirmTripAction: jest.fn(),
  confirmRouteRemoval: jest.fn(),
  leaveRoute: jest.fn(),
  getConfirmationTitle: jest.fn(),
  getConfirmationBody: jest.fn(),
}))

const mockSetUser = jest.fn()
const mockUser = {
  id: 1,
  name: 'Dylan Reimer',
  nickname: 'dylanBustaReimez',
  role: 'user',
  description: 'goat',
}

jest.mock('../../../context/UserContext', () => ({
  useUser: jest.fn(),
}))

// mock trip data
const activeTrips = [
  {
    id: 1,
    title: 'Active Non-Departed Trip',
    completed: false,
    creator_id: 2,
    depart_time: '2026-05-30T12:00:00.000Z',
  },
  {
    id: 2,
    title: 'Active Departed Trip',
    completed: false,
    creator_id: 1,
    depart_time: '2026-04-30T12:00:00.000Z',
  },
  {
    id: 3,
    title: 'Active Non-Departed Trip Creator',
    completed: false,
    creator_id: 1,
    depart_time: '2026-05-30T12:00:00.000Z',
  },
  {
    id: 4,
    title: 'Trip With Route',
    completed: false,
    creator_id: 2,
    depart_time: '2026-05-30T12:00:00.000Z',
    path: {
      polyline: {
        encodedPolyline: 'uppkHdcfnV',
      },
    },
  },
]

const completedTrips = [
  {
    id: 5,
    title: 'Completed Trip',
    completed: true,
    creator_id: 2,
    depart_time: '2026-04-29T12:00:00.000Z',
  },
]

fetchMyTrips.mockImplementation((setActive, setCompleted) => {
  setActive(activeTrips)
  setCompleted(completedTrips)
  return Promise.resolve()
})

const routeCardStrings = routeStrings.routeCard
const routeCardWrapperStrings = routeStrings.routeCardWrapper

const getCard = id => document.querySelector(`[data-testid="route-card-${id}"]`)
const getWrapper = id =>
  document.querySelector(`[data-testid="route-card-wrapper-${id}"]`)

describe('MyTrips', () => {
  const { useUser } = require('../../../context/UserContext')

  beforeEach(() => {
    useUser.mockReturnValue({ user: mockUser, setUser: mockSetUser })
  })

  test('renders active/complete toggle', async () => {
    await act(async () => render(<MyTrips />))

    expect(screen.getByText(myTripsStrings.activeTrips)).toBeInTheDocument()
    expect(screen.getByText(myTripsStrings.completedTrips)).toBeInTheDocument()
  })

  test('renders active trips by default', async () => {
    await act(async () => render(<MyTrips />))

    expect(screen.getByText('Active Non-Departed Trip')).toBeInTheDocument()
    expect(screen.getByText('Active Departed Trip')).toBeInTheDocument()
    expect(screen.queryByText('Completed Trip')).not.toBeInTheDocument()
  })

  test('renders completed trips when toggle switched', async () => {
    await act(async () => render(<MyTrips />))
    fireEvent.click(screen.getByText(myTripsStrings.completedTrips))

    expect(screen.getByText('Completed Trip')).toBeInTheDocument()
    expect(
      screen.queryByText('Active Non-Departed Trip')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Active Departed Trip')).not.toBeInTheDocument()
  })

  test('renders active non-departed trip without completed/didnt go button but with leave button', async () => {
    await act(async () => render(<MyTrips />))

    expect(
      within(getCard(1)).queryByRole('button', { name: routeCardStrings.leave })
    ).toBeInTheDocument()
    expect(
      within(getWrapper(1)).queryByText(routeCardWrapperStrings.completed)
    ).not.toBeInTheDocument()
    expect(
      within(getWrapper(1)).queryByText(routeCardWrapperStrings.didntGo)
    ).not.toBeInTheDocument()
  })

  test('renders active departed trip with completed/didnt go buttons and without leave button', async () => {
    await act(async () => render(<MyTrips />))

    expect(
      within(getCard(2)).queryByRole('button', { name: routeCardStrings.leave })
    ).not.toBeInTheDocument()
    expect(
      within(getWrapper(2)).queryByText(routeCardWrapperStrings.completed)
    ).toBeInTheDocument()
    expect(
      within(getWrapper(2)).queryByText(routeCardWrapperStrings.didntGo)
    ).toBeInTheDocument()
  })

  test('renders report button regardless if trip is departed or non-departed', async () => {
    await act(async () => render(<MyTrips />))

    // non-departed report button lies in routecard
    expect(
      within(getCard(1)).queryByText(routeStrings.common.report)
    ).toBeInTheDocument()
    // departed report button lies in routecardwrapper
    expect(
      within(getWrapper(2)).queryByText(routeStrings.common.report)
    ).toBeInTheDocument()
  })

  test('renders completed trip with no buttons', async () => {
    await act(async () => render(<MyTrips />))
    fireEvent.click(screen.getByText(myTripsStrings.completedTrips))

    expect(
      within(getCard(5)).queryByRole('button', { name: routeCardStrings.leave })
    ).not.toBeInTheDocument()
    expect(
      within(getWrapper(5)).queryByText(routeCardWrapperStrings.completed)
    ).not.toBeInTheDocument()
    expect(
      within(getWrapper(5)).queryByText(routeCardWrapperStrings.didntGo)
    ).not.toBeInTheDocument()
    expect(
      within(getCard(5)).queryByRole('button', {
        name: routeStrings.common.report,
      })
    ).not.toBeInTheDocument()
    expect(
      within(getWrapper(5)).queryByRole('button', {
        name: routeStrings.common.report,
      })
    ).not.toBeInTheDocument()
  })

  test('opens report modal when report button is clicked', async () => {
    await act(async () => render(<MyTrips />))
    fireEvent.click(
      screen.getAllByRole('button', { name: routeStrings.common.report })[0]
    )

    expect(screen.getByText(myTripsStrings.reportTitle)).toBeInTheDocument()
  })

  test('calls leaveRoute when non-creator leaves route', async () => {
    await act(async () => render(<MyTrips />))
    fireEvent.click(
      within(getCard(1)).queryByRole('button', { name: routeCardStrings.leave })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(leaveRoute).toHaveBeenCalled()
  })

  test('opens route delete dialog for creator', async () => {
    await act(async () => render(<MyTrips />))
    fireEvent.click(
      within(getCard(3)).queryByRole('button', { name: routeCardStrings.leave })
    )

    expect(screen.getByText(myTripsStrings.creatorLeave)).toBeInTheDocument()
  })

  test('calls confirmTripAction on action confirm', async () => {
    await act(async () => render(<MyTrips />))
    fireEvent.click(
      screen.getAllByRole('button', {
        name: routeCardWrapperStrings.completed,
      })[0]
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(confirmTripAction).toHaveBeenCalled()
  })

  test('hides map by default and shows show map button', async () => {
    await act(async () => render(<MyTrips />))

    expect(
      within(getWrapper(4)).queryByText(routeCardWrapperStrings.showMap)
    ).toBeInTheDocument()
    expect(
      within(getWrapper(4)).queryByText(routeCardWrapperStrings.hideMap)
    ).not.toBeInTheDocument()
    expect(
      document.querySelector('[data-testid="mini-map-4"]').closest('.max-h-0')
    ).toBeInTheDocument()
  })

  test('shows map and switches to hide map button when show map is clicked', async () => {
    await act(async () => render(<MyTrips />))
    fireEvent.click(
      within(getWrapper(4)).getByText(routeCardWrapperStrings.showMap)
    )

    expect(
      within(getWrapper(4)).queryByText(routeCardWrapperStrings.hideMap)
    ).toBeInTheDocument()
    expect(
      within(getWrapper(4)).queryByText(routeCardWrapperStrings.showMap)
    ).not.toBeInTheDocument()
    expect(
      document.querySelector('[data-testid="mini-map-4"]').closest('.max-h-48')
    ).toBeInTheDocument()
  })

  test('does not show map toggle for trips without a route', async () => {
    await act(async () => render(<MyTrips />))

    expect(
      within(getWrapper(1)).queryByText(routeCardWrapperStrings.showMap)
    ).not.toBeInTheDocument()
    expect(
      within(getWrapper(1)).queryByText(routeCardWrapperStrings.hideMap)
    ).not.toBeInTheDocument()
  })
})
