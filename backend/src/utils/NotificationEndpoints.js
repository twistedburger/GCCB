const express = require('express')
const router = express.Router()
const { serverStrings } = require('../../locales/en/serverLocales')
const {
  insertNotification,
  viewUserNotification,
  viewAllUserNotifications,
  getUserNotifications,
} = require('./NotificationQueries')
const { selectUser } = require('../../server')

/**
 * Creates a notification to add to the database, and adds a reference to all users relevant to the notification
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} {success: true}
 */
router.post('/notify', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).json({ error: serverStrings.errors.accessDenied })
  }
  const user = await selectUser(req)
  const { notification } = req.body
  notification.userID = user.id

  try {
    await insertNotification(notification)
    return res.status(200).json({ success: true })
    // send notifications
  } catch (error) {
    console.log(error)
    const message = error.message.includes(
      serverStrings.errors.notificationError
    )
      ? serverStrings.errors.notificationSendError
      : serverStrings.errors.generic
    return res.status(500).json({ error: message })
  }
})

/**
 * clear notifications for a user by marking the read_at time to now. This function either dispatches a batch clear
 * for all notifications, or a single specified notification.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} {success: true}
 */
router.patch('/clearNotifications', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).json({ error: serverStrings.errors.accessDenied })
  }

  try {
    const user = await selectUser(req)
    const { notificationToClear } = req.body

    if (notificationToClear.all) {
      await viewAllUserNotifications(user.id)
    } else {
      await viewUserNotification(user.id, notificationToClear.notificationID)
    }
    return res.status(200).json({ success: true })
  } catch {
    return res.status(500).json({ error: serverStrings.errors.generic })
  }
})

/**
 * fetches all notifications for the logged in user.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} {notifications: [notification]}
 */
router.get('/getNotifications', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).json({ error: serverStrings.errors.accessDenied })
  }
  try {
    const user = await selectUser(req)
    const notifications = await getUserNotifications(user.id)
    return res.status(200).json({ notifications: notifications })
  } catch {
    return res.status(500).json({ error: serverStrings.errors.generic })
  }
})

module.exports = router
