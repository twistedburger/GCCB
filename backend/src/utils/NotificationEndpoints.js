const express = require('express')
const router = express.Router()
const {
  insertNotification,
  NotificationType,
  viewUserNotification,
  viewAllUserNotifications,
  getUserNotifications,
} = require('./NotificationQueries')

insertNotification({ notification: NotificationType.Route })
viewAllUserNotifications(1)
viewUserNotification(1, 1)
getUserNotifications(1)

module.exports = router
