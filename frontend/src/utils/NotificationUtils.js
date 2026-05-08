/**
 * Load the notifications for the logged in user.
 *
 * @param {Function} setNotifications callback for setting notifications
 */
export async function loadNotifications(setNotifications) {
  try {
    const response = await fetch(
      'http://localhost:3000/notifications/getNotifications',
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
