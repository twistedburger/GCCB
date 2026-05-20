import {
  loadNotifications,
  clearAllNotifications,
  clearNotification,
  getNotificationDetails,
} from '../NotificationUtils'
import { notificationStrings } from '../../locales/en/NotificationStrings'
import { NotificationType } from '../../../../shared/NotificationTypes'

global.fetch = jest.fn()

describe('loadNotifications', () => {
  const mockSetNotifications = jest.fn()
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls setNotifications with notifications on success', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ notifications: [{ notificationID: 1 }] }),
    })
    await loadNotifications(mockSetNotifications)
    expect(mockSetNotifications).toHaveBeenCalledWith([{ notificationID: 1 }])
  })

  test('logs error and does not call setNotifications when response is not ok', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'unauthorized' }),
    })
    await loadNotifications(mockSetNotifications)
    expect(consoleSpy).toHaveBeenCalledWith('unauthorized')
    expect(mockSetNotifications).not.toHaveBeenCalled()
  })

  test('logs error when fetch throws', async () => {
    fetch.mockRejectedValue(new Error('network error'))
    await loadNotifications(mockSetNotifications)
    expect(consoleSpy).toHaveBeenCalledWith(
      notificationStrings.errorLoadingNotifications
    )
    expect(mockSetNotifications).not.toHaveBeenCalled()
  })
})

describe('clearAllNotifications', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns true on success', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
    const result = await clearAllNotifications()
    expect(result).toBe(true)
  })

  test('returns false and logs error when response is not ok', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'failed' }),
    })
    const result = await clearAllNotifications()
    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('failed')
  })

  test('returns false and logs error when fetch throws', async () => {
    fetch.mockRejectedValue(new Error('network error'))
    const result = await clearAllNotifications()
    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith(
      notificationStrings.errorClearingNotifications
    )
  })

  test('sends correct request body', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    await clearAllNotifications()
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ all: true }),
      })
    )
  })
})

describe('clearNotification', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns true on success', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    const result = await clearNotification(5)
    expect(result).toBe(true)
  })

  test('returns false and logs error when response is not ok', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'failed' }),
    })
    const result = await clearNotification(5)
    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('failed')
  })

  test('returns false and logs error when fetch throws', async () => {
    fetch.mockRejectedValue(new Error('network error'))
    const result = await clearNotification(5)
    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith(
      notificationStrings.errorClearingNotifications
    )
  })

  test('sends correct request body with notificationID', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    await clearNotification(5)
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ all: false, notificationID: 5 }),
      })
    )
  })
})

describe('getNotificationDetails', () => {
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const baseNotification = {
    metadata: {
      message: 'test message',
      title: 'test title',
      isDeleted: false,
    },
    createdAt: '2024-01-01',
  }

  test('returns correct base details', async () => {
    const notification = {
      ...baseNotification,
      notificationType: NotificationType.Route.type,
      routeID: 1,
    }
    const { details } = await getNotificationDetails(notification, mockNavigate)
    expect(details.message).toBe('test message')
    expect(details.title).toBe('test title')
    expect(details.time).toBe('2024-01-01')
  })

  test('navigates to route on click when not deleted', async () => {
    const notification = {
      ...baseNotification,
      notificationType: NotificationType.Route.type,
      routeID: 26,
    }
    const { details } = await getNotificationDetails(notification, mockNavigate)
    await details.onClick()
    expect(mockNavigate).toHaveBeenCalledWith('/mytrip/26')
  })

  test('does not navigate for deleted route', async () => {
    const notification = {
      ...baseNotification,
      notificationType: NotificationType.Route.type,
      routeID: 26,
      metadata: { ...baseNotification.metadata, isDeleted: true },
    }
    const { details } = await getNotificationDetails(notification, mockNavigate)
    await details.onClick()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('navigates to event on click when not deleted', async () => {
    const notification = {
      ...baseNotification,
      notificationType: NotificationType.Event.type,
      eventID: 10,
    }
    const { details } = await getNotificationDetails(notification, mockNavigate)
    await details.onClick()
    expect(mockNavigate).toHaveBeenCalledWith('/event/10')
  })

  test('does not navigate for deleted event', async () => {
    const notification = {
      ...baseNotification,
      notificationType: NotificationType.Event.type,
      eventID: 10,
      metadata: { ...baseNotification.metadata, isDeleted: true },
    }
    const { details } = await getNotificationDetails(notification, mockNavigate)
    await details.onClick()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('navigates to badge on click when not deleted', async () => {
    const notification = {
      ...baseNotification,
      notificationType: NotificationType.Badge.type,
      badgeID: 3,
    }
    const { details } = await getNotificationDetails(notification, mockNavigate)
    await details.onClick()
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/badges/3')
  })

  test('does not navigate for deleted badge', async () => {
    const notification = {
      ...baseNotification,
      notificationType: NotificationType.Badge.type,
      badgeID: 3,
      metadata: { ...baseNotification.metadata, isDeleted: true },
    }
    const { details } = await getNotificationDetails(notification, mockNavigate)
    await details.onClick()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('returns no onClick for unknown notification type', async () => {
    const notification = { ...baseNotification, notificationType: 'unknown' }
    const { details } = await getNotificationDetails(notification, mockNavigate)
    expect(details.onClick).toBeUndefined()
  })
})
