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
    if (notifications.error) {
      return
    }
    setNotifications(notifications.notifications)
  } catch (error) {
    console.log(error)
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
    if (notifications.error) {
      return false
    }
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
