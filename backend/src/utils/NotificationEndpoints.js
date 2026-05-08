const express = require('express')
const notificationRouter = express.Router()
const { serverStrings } = require('../../locales/en/serverLocales')
const {
  insertNotification,
  viewUserNotification,
  viewAllUserNotifications,
  getUserNotifications,
} = require('./NotificationQueries')
const { EventEmitter } = require('events')
const { selectUser } = require('./UserUtils')

const notificationEmitter = new EventEmitter()

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
    notification.userID = user.id
    const notifications = await insertNotification(notification)
    notificationEmitter.emit('notification', notifications)

    return res.status(200).json({ success: true })
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
notificationRouter.patch('/clearNotifications', async (req, res) => {
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

  const handleNotifications = async notifications => {
    const usersToNotify = notifications.map(
      notification => notification.user_id
    )
    try {
      const user = await selectUser(req)
      if (usersToNotify.includes(user.id)) {
        const notifications = await getUserNotifications(user.id)
        res.write(`data: ${JSON.stringify({ notifications })}\n\n`)
      }
    } catch {
      res.write(
        `data: ${JSON.stringify({ error: serverStrings.errors.generic })}\n\n`
      )
    }
  }

  notificationEmitter.on('notification', handleNotifications)

  req.on('close', () =>
    notificationEmitter.off('notification', handleNotifications)
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

module.exports = { notificationRouter, notificationEmitter }
