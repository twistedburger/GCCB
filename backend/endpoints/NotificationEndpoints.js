const express = require('express')
const notificationRouter = express.Router()
const {
  viewUserNotification,
  viewAllUserNotifications,
  getUserNotifications,
} = require('../src/services/NotificationServices')
const { selectUser } = require('../src/utils/UserUtils')
const {
  handleNotifications,
  sendNotification,
  notificationEmitter,
} = require('../src/utils/NotificationUtils')
const { serverStrings } = require('../locales/en/serverLocales')

/**
 * Creates a notification to add to the database, and adds a reference to all users relevant to the notification
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} {success: true}
 */
notificationRouter.post('/notify', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).json({ error: serverStrings.errors.accessDenied })
  }

  try {
    const user = await selectUser(req)
    const notification = req.body
    const result = await sendNotification(
      notification.type,
      notification.id,
      notification.metadata.title,
      user.id,
      notification.metadata.message,
      notification.metadata.isDeleted
    )
    if (result) {
      return res.status(200).json({ success: true })
    }
    return res
      .status(500)
      .json({ error: serverStrings.errors.notificationSendError })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: serverStrings.errors.generic })
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
notificationRouter.patch('/clearNotifications', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).json({ error: serverStrings.errors.accessDenied })
  }

  try {
    const user = await selectUser(req)
    const notificationToClear = req.body

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
 * fetches all notifications for the logged in user. This route writes the current notifications whenever a new notification is sent
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} {notifications: [notification]}
 */
notificationRouter.get('/listenForNotifications', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).json({ error: serverStrings.errors.accessDenied })
  }
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  let notificationHandler = handleNotifications(req, res)
  notificationEmitter.on('notification', notificationHandler)

  req.on('close', () =>
    notificationEmitter.off('notification', notificationHandler)
  )
})

/**
 * fetches all notifications for the logged in user.
 *
 * If the user is not authenticated, a 403 access is forbidden error is sent with an error json {error: string}.
 * If the database has an error, a 500 status code is sent with an error json {error: string}.
 *
 * @returns {Object} {notifications: [notification]}
 */
notificationRouter.get('/getNotifications', async (req, res) => {
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

module.exports = { notificationRouter }
