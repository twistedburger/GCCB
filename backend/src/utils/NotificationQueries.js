const db = require('../../db')

export const NotificationTypes = Object.freeze({
  Event: {
    idType: 'event_id',
    type: 'event',
    getUsersQuery: `SELECT ur.user_id FROM "user_route" ur JOIN "event_route" er ON ur.route_id = er.route_id WHERE er.event_id = $1`,
  },
  Route: {
    idType: 'route_id',
    type: 'route',
    getUsersQuery: `SELECT user_id FROM "user_route" WHERE route_id = $1`,
  },
  Badge: {
    idType: 'badge_id',
    type: 'badge',
    getUsersQuery: `SELECT user_id FROM "user_badge" WHERE badge_id = $1`,
  },
  Message: {
    idType: 'message_id',
    type: 'message',
    getUsersQuery: `SELECT user_id FROM "user_message" WHERE message_id = $1`,
  },
})

/**
 * Add a notification to the notification table, and collects all approrpriate user id's and updates the user_notification table.
 *
 * @param {Object} notification object to insert into database. Ensure the type is of NotificationTypes
 * @throws {Error} if notification type is not a known notification type
 */
export async function insertNotification(notification) {
  const notificationType = notification.type
  if (!notificationType?.idType)
    throw new Error(`Unknown notification type: ${notification.type}`)

  const result = await db.query(
    `INSERT INTO "notification" (notification_type, ${notificationType.idType}, metadata) 
         VALUES ($1, $2, $3) RETURNING *`,
    [notificationType.type, notification.id, notification.metadata]
  )
  const notificationID = result.rows[0].notification_id

  const userQuery = await db.query(notificationType.getUsersQuery, [
    notification.id,
  ])

  if (userQuery.rows.length > 0) {
    const values = userQuery.rows
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
      .join(', ')
    const params = userQuery.rows.flatMap(row => [row.user_id, notificationID])
    await db.query(
      `INSERT INTO "user_notification" (user_id, notification_id) VALUES ${values}`,
      params
    )
  }
}

/**
 * Set the user's notification read_at time to now.
 *
 * @param {String} userID user's id
 * @param {String} notificationID notification id
 */
export async function viewUserNotification(userID, notificationID) {
  await db.query(
    `UPDATE "user_notification" SET read_at = NOW() 
         WHERE user_id = $1 AND notification_id = $2 AND read_at IS NULL`,
    [userID, notificationID]
  )
}

/**
 * Set all user's notifications read_at time to now.
 *
 * @param {String} userID user's id
 */
export async function viewAllUserNotifications(userID) {
  await db.query(
    `UPDATE "user_notification" SET read_at = NOW() 
         WHERE user_id = $1 AND read_at IS NULL`,
    [userID]
  )
}

/**
 * Get all the unread notifications for a user
 *
 * @param {String} userID user id string
 * @returns {Array} the notifications for a user
 */
export async function getUserNotifications(userID) {
  const result = await db.query(
    `SELECT notification.* FROM "notification"
         JOIN "user_notification" ON notification.notification_id = user_notification.notification_id
         WHERE user_notification.user_id = $1 AND user_notification.read_at IS NULL
         ORDER BY notification.created_at DESC`,
    [userID]
  )
  return result.rows
}
