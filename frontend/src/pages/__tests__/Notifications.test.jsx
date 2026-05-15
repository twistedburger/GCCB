import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Notifications from '../Notifications'
import { useNotifications } from '../../../context/NotificationContext'
import { clearAllNotifications } from '../../utils/NotificationUtils'
import { notificationStrings } from '../../locales/en/NotificationStrings'

jest.mock('../../../context/NotificationContext')
jest.mock('../../utils/NotificationUtils')
jest.mock('../../components/NotificationCard', () => {
  const PropTypes = require('prop-types')
  const NotificationCard = ({ notification }) => (
    <div data-testid="notification-card">{notification.notificationID}</div>
  )
  NotificationCard.displayName = 'NotificationCard'
  NotificationCard.propTypes = {
    notification: PropTypes.shape({
      notificationID: PropTypes.number.isRequired,
    }).isRequired,
  }
  return NotificationCard
})

jest.mock('../../components/GenericButton', () => {
  const PropTypes = require('prop-types')
  const GenericButton = ({ onClick, children }) => (
    <button onClick={onClick}>{children}</button>
  )
  GenericButton.displayName = 'GenericButton'
  GenericButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  }
  return GenericButton
})

describe('Notifications page', () => {
  const mockSetNotifications = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useNotifications.mockReturnValue({
      notifications: [],
      setNotifications: mockSetNotifications,
    })
  })

  test('renders title', () => {
    render(<Notifications />)
    expect(screen.getByText(notificationStrings.title)).toBeInTheDocument()
  })

  test('renders clear all button', () => {
    render(<Notifications />)
    expect(screen.getByText(notificationStrings.clearAll)).toBeInTheDocument()
  })

  test('renders a NotificationCard for each notification', () => {
    useNotifications.mockReturnValue({
      notifications: [
        { notificationID: 1 },
        { notificationID: 2 },
        { notificationID: 3 },
      ],
      setNotifications: mockSetNotifications,
    })
    render(<Notifications />)
    expect(screen.getAllByTestId('notification-card')).toHaveLength(3)
  })

  test('renders no cards when notifications is empty', () => {
    render(<Notifications />)
    expect(screen.queryByTestId('notification-card')).not.toBeInTheDocument()
  })

  test('clears notifications when clearAll succeeds', async () => {
    clearAllNotifications.mockResolvedValue(true)
    render(<Notifications />)
    fireEvent.click(screen.getByText(notificationStrings.clearAll))
    await waitFor(() => {
      expect(mockSetNotifications).toHaveBeenCalledWith([])
    })
  })

  test('does not clear notifications when clearAll fails', async () => {
    clearAllNotifications.mockResolvedValue(false)
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    render(<Notifications />)
    fireEvent.click(screen.getByText(notificationStrings.clearAll))
    await waitFor(() => {
      expect(mockSetNotifications).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        notificationStrings.errorClearingNotifications
      )
    })
    consoleSpy.mockRestore()
  })
})
