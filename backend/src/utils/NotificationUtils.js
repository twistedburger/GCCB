const { serverStrings } = require('../../locales/en/serverLocales')
const {
  getUserNotifications,
  insertNotification,
} = require('../services/NotificationServices')
const { selectUser } = require('./UserUtils')
const { EventEmitter } = require('events')
const notificationEmitter = new EventEmitter()

/**
 * creates a handler which handles the notifications when the notification event is recieved
 * @param {Object} req server request
 * @param {Object} res server response
 * @returns notification handler function which takes a list of notifications to be sent and checks
 * if the current user is logged in
 */
const handleNotifications = (req, res) => async notifications => {
  const usersToNotify = notifications.map(notification => notification.user_id)
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
/**
 * Sends a notification.
 *
 * @param {NotificationType} notificationType - The type of the notification
 * @param {number} itemID - The Database ID of the item the notification is about
 * @param {string} itemTitle - The title of the item the notification is about (EG. "Hackathon", "Bus to BCIT")
 * @param {number} userID - The user ID
 * @param {string} message - The message relevant to the notification (EG. "Route deleted")
 * @param {bool} isDeleted - boolean if the item has been deleted. Default false
 * @param {bool} sendToUser - boolean if the notification should be sent to the user
 * @returns {bool} success
 */
const sendNotification = async (
  notificationType,
  itemID,
  itemTitle,
  userID,
  message,
  isDeleted = false,
  sendToUser = false
) => {
  const notification = {
    type: notificationType,
    id: itemID,
    userID: userID,
    metadata: { message: message, title: itemTitle, isDeleted: isDeleted },
  }
  try {
    const notifications = await insertNotification(notification, sendToUser)
    notificationEmitter.emit('notification', notifications)
    return true
  } catch (error) {
    const message = error.message.includes(
      serverStrings.errors.notificationError
    )
      ? serverStrings.errors.notificationSendError
      : serverStrings.errors.generic
    console.log(error + ' - ' + message)
    return false
  }
}

module.exports = { handleNotifications, sendNotification, notificationEmitter }
