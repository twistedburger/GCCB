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

router.get('/getNotifications', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).json({ error: serverStrings.errors.accessDenied })
  }
})

// Hack to commit while WIP because I dont want to remove the includes :')
getUserNotifications(1)

module.exports = router
