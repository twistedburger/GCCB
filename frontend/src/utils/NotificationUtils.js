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
      details.onClick = async () => {
        navigate(`/mytrip/${notification.routeID}`)
      }
      break
    }

    case NotificationType.Event.type: {
      details.onClick = async () => {
        navigate(`/event/${notification.eventID}`)
      }
      break
    }

    case NotificationType.Badge.type: {
      details.onClick = async () => {
        navigate(`/dashboard/badges/${notification.badgeID}`)
      }
      break
    }

    default:
      break
  }
  return {
    details,
  }
}

/**
 * Sends a notification.
 *
 * @param {NotificationType} notificationType - The type of the notification
 * @param {number} itemID - The Database ID of the item the notification is about
 * @param {string} itemTitle - The title of the item the notification is about (EG. "Hackathon", "Bus to BCIT")
 * @param {string} message - The message relevant to the notification (EG. "Route deleted")
 * @param {bool} isDeleted - boolean if the item has been deleted. Default false
 * @returns {bool} success
 */
export async function sendNotification(
  notificationType,
  itemID,
  itemTitle,
  message,
  isDeleted = false
) {
  if (!Object.values(NotificationType).includes(notificationType)) {
    console.log(notificationStrings.invalidNotification)
    return false
  }

  const notification = {
    type: notificationType,
    id: itemID,
    metadata: { message: message, title: itemTitle, isDeleted: isDeleted },
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/notifications/notify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
        credentials: 'include',
      }
    )
    const responseJson = await response.json()
    if (!response.ok) {
      console.log(responseJson.error)
      return false
    }
  } catch {
    console.log(notificationStrings.errorSendingNotifications)
  }
}
