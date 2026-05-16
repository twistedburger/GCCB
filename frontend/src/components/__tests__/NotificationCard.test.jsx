import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NotificationCard from '../NotificationCard'
import { useNotifications } from '../../../context/NotificationContext'
import {
  clearNotification,
  getNotificationDetails,
} from '../../utils/NotificationUtils'
import { useNavigate } from 'react-router-dom'
import { notificationStrings } from '../../locales/en/NotificationStrings'

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}))

jest.mock('../../../context/NotificationContext', () => ({
  useNotifications: jest.fn(),
}))

jest.mock('../../utils/NotificationUtils', () => ({
  clearNotification: jest.fn(),
  getNotificationDetails: jest.fn(),
}))

jest.mock('../GenericCard', () => {
  const PropTypes = require('prop-types')
  const GenericCard = ({ children, onClick }) => (
    <div data-testid="generic-card" onClick={onClick}>
      {children}
    </div>
  )
  GenericCard.displayName = 'GenericCard'
  GenericCard.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
  }
  return GenericCard
})

const mockNavigate = jest.fn()
const mockSetNotifications = jest.fn()

const mockNotification = {
  notificationID: 1,
  notificationType: { type: 'route' },
  routeID: 10,
  eventID: null,
  badgeID: null,
  metadata: {},
  createdAt: '2024-01-01T00:00:00Z',
}

const mockNotificationDetails = {
  title: 'Test Title',
  message: 'Test Message',
  time: '12:00 PM',
  onClick: jest.fn(),
}

describe('NotificationCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useNavigate.mockReturnValue(mockNavigate)
    useNotifications.mockReturnValue({
      notifications: [mockNotification],
      setNotifications: mockSetNotifications,
    })
  })

  test('renders loading state while fetching details', () => {
    getNotificationDetails.mockReturnValue(new Promise(() => {}))

    render(<NotificationCard notification={mockNotification} />)

    expect(screen.getByTestId('generic-card')).toBeInTheDocument()
    expect(screen.getByText(notificationStrings.loading)).toBeInTheDocument()
  })

  test('renders notification details after fetching', async () => {
    getNotificationDetails.mockResolvedValue({
      details: mockNotificationDetails,
    })

    render(<NotificationCard notification={mockNotification} />)

    await waitFor(() => {
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Message')).toBeInTheDocument()
      expect(screen.getByText(/12:00 PM/)).toBeInTheDocument()
    })
  })

  test('calls getNotificationDetails with correct args', async () => {
    getNotificationDetails.mockResolvedValue({
      details: mockNotificationDetails,
    })

    render(<NotificationCard notification={mockNotification} />)

    await waitFor(() => {
      expect(getNotificationDetails).toHaveBeenCalledWith(
        mockNotification,
        mockNavigate
      )
    })
  })

  test('clicking card calls clearNotification with correct notificationID', async () => {
    getNotificationDetails.mockResolvedValue({
      details: mockNotificationDetails,
    })

    render(<NotificationCard notification={mockNotification} />)

    await waitFor(() => screen.getByText('Test Title'))
    fireEvent.click(screen.getByTestId('generic-card'))

    expect(clearNotification).toHaveBeenCalledWith(
      mockNotification.notificationID
    )
  })

  test('clicking card removes notification from context', async () => {
    const otherNotification = { ...mockNotification, notificationID: 2 }
    useNotifications.mockReturnValue({
      notifications: [mockNotification, otherNotification],
      setNotifications: mockSetNotifications,
    })
    getNotificationDetails.mockResolvedValue({
      details: mockNotificationDetails,
    })

    render(<NotificationCard notification={mockNotification} />)

    await waitFor(() => screen.getByText('Test Title'))
    fireEvent.click(screen.getByTestId('generic-card'))

    expect(mockSetNotifications).toHaveBeenCalledWith([otherNotification])
  })

  test('clicking card calls notificationDetails.onClick', async () => {
    getNotificationDetails.mockResolvedValue({
      details: mockNotificationDetails,
    })

    render(<NotificationCard notification={mockNotification} />)

    await waitFor(() => screen.getByText('Test Title'))
    fireEvent.click(screen.getByTestId('generic-card'))

    expect(mockNotificationDetails.onClick).toHaveBeenCalled()
  })

  test('does not render details if getNotificationDetails returns null details', async () => {
    getNotificationDetails.mockResolvedValue({ details: null })

    render(<NotificationCard notification={mockNotification} />)

    await waitFor(() => {
      expect(screen.getByText(notificationStrings.loading)).toBeInTheDocument()
    })
  })

  test('re-fetches details when notification prop changes', async () => {
    getNotificationDetails.mockResolvedValue({
      details: mockNotificationDetails,
    })

    const { rerender } = render(
      <NotificationCard notification={mockNotification} />
    )

    await waitFor(() => screen.getByText('Test Title'))

    const newNotification = { ...mockNotification, notificationID: 99 }
    rerender(<NotificationCard notification={newNotification} />)

    await waitFor(() => {
      expect(getNotificationDetails).toHaveBeenCalledTimes(2)
      expect(getNotificationDetails).toHaveBeenLastCalledWith(
        newNotification,
        mockNavigate
      )
    })
  })
})
