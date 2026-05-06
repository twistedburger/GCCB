const express = require('express')
const router = express.Router()
const { serverStrings } = require('../../locales/en/serverLocales')
const {
  insertNotification,
  NotificationType,
  viewUserNotification,
  viewAllUserNotifications,
  getUserNotifications,
} = require('./NotificationQueries')

router.post('/notify', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }
})

router.post('/clearNotifications', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }
})

router.get('/getNotifications', async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(403).send(serverStrings.errors.accessDenied)
  }
})

// Hack to commit while WIP because I dont want to remove the includes :')
insertNotification({ notification: NotificationType.Route })
viewAllUserNotifications(1)
viewUserNotification(1, 1)
getUserNotifications(1)

module.exports = router
