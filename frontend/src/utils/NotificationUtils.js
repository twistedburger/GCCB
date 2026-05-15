import { NotificationType } from '../../../shared/NotificationTypes'
import { notificationStrings } from '../locales/en/NotificationStrings'

/**
 * Load the notifications for the logged in user.
 *
 * @param {Function} setNotifications callback for setting notifications
 */
export async function loadNotifications(setNotifications) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/notifications/getNotifications`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    )
    const notifications = await response.json()
    if (!response.ok) {
      console.log(notifications.error)
      return
    }
    setNotifications(notifications.notifications)
  } catch {
    console.log(notificationStrings.errorLoadingNotifications)
  }
}

/**
 * Clear all the notifications for a user.
 *
 * @returns a boolean indicating if the notifications were cleared
 */
export async function clearAllNotifications() {
  try {
    const request = { all: true }
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/notifications/clearNotifications`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        credentials: 'include',
      }
    )
    const notifications = await response.json()
    if (!response.ok) {
      console.log(notifications.error)
      return false
    }
    return true
  } catch {
    console.log(notificationStrings.errorClearingNotifications)
    return false
  }
}

/**
 * Clear the selected notification.
 *
 * @param {number} notificationID
 */
export async function clearNotification(notificationID) {
  try {
    const request = { all: false, notificationID: notificationID }
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/notifications/clearNotifications`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        credentials: 'include',
      }
    )
    const notifications = await response.json()
    if (!response.ok) {
      console.log(notifications.error)
      return false
    }
    return true
  } catch {
    console.log(notificationStrings.errorClearingNotifications)
    return false
  }
}

/**
 * Get the details of the current notification.
 *
 * @param {Object} notification
 * @returns {Object} notification details:
 * {
 *   title: Relevant title of what the notification links to (event name, route name, etc.),
 *   message: Notification message (route updated, badge earned, etc.),
 *   time: Time notification was sent,
 *   onClick: Callback function on how to handle clicking notification
 * }
 */
export async function getNotificationDetails(notification, navigate) {
  const details = {
    message: notification.metadata.message,
    time: notification.createdAt,
    title: notification.metadata.title,
  }

  switch (notification.notificationType) {
    case NotificationType.Route.type: {
      details.onClick = !notification.metadata.isDeleted
        ? async () => {
            navigate(`/mytrip/${notification.routeID}`)
          }
        : async () => {}
      break
    }

    case NotificationType.Event.type: {
      details.onClick = !notification.metadata.isDeleted
        ? async () => {
            navigate(`/event/${notification.eventID}`)
          }
        : async () => {}
      break
    }

    case NotificationType.Badge.type: {
      details.onClick = !notification.metadata.isDeleted
        ? async () => {
            navigate(`/dashboard/badges/${notification.badgeID}`)
          }
        : async () => {}
      break
    }

    default:
      break
  }
  return {
    details,
  }
}
