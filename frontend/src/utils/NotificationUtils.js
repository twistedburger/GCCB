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
 * Get the details of the current notification
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
export async function getNotificationDetails(notification) {
  switch (notification.type) {
    case 'route':
      await fetchRoute(notification.routeID)
      break
    case 'event':
      await fetchEvent(notification.eventID)
      break
    case 'badge':
      await fetchBadge(notification.badgeID)
      break
    default:
      break
  }
  return {
    title: notification.notificationType,
    message: notification.metadata.message,
    time: notification.createdAt,
    onClick: () => {
      console.log(notification.notificationType)
    },
  }
}

/**
 * Helper function to fetch the route based on route ID
 *
 * @param {number} routeID
 */
async function fetchRoute(routeID) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/routes/getRoute?id=${routeID}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    )
    const route = await response.json()
    if (!response.ok) {
      console.log(route.error)
      return null
    }
  } catch {
    console.log(notificationStrings.errorLoadingRoute)
  }
}

/**
 * Helper function to fetch the event based on event ID
 *
 * @param {number} eventID
 */
async function fetchEvent(eventID) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/eventdetail?id=${eventID}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    )
    const event = await response.json()
    if (!response.ok) {
      console.log(event.error)
      return null
    }
  } catch {
    console.log(notificationStrings.errorLoadingEvent)
  }
}

/**
 * Helper function to fetch the badge based on badge ID
 *
 * @param {number} badgeID
 */
async function fetchBadge(badgeID) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/badges/getBadge?id=${badgeID}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    )
    const badge = await response.json()
    if (!response.ok) {
      console.log(badge.error)
      return null
    }
  } catch {
    console.log(notificationStrings.errorLoadingBadge)
  }
}
