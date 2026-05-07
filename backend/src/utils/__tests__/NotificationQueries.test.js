const { serverStrings } = require('../../../locales/en/serverLocales')
const {
  insertNotification,
  NotificationType,
  viewUserNotification,
  viewAllUserNotifications,
  getUserNotifications,
} = require('../NotificationQueries')

jest.mock('../../../db', () => ({
  query: jest.fn(),
}))

const db = require('../../../db')

describe('Test insertNotification database query', () => {
  beforeEach(() => {
    db.query.mockClear()
  })

  test('Notification type not set throws error', async () => {
    const notification = { metadata: { message: 'new notification' } }
    await expect(insertNotification(notification)).rejects.toThrow(
      `${serverStrings.errors.notificationError} undefined`
    )
  })

  test('Invalid notification type throws error', async () => {
    const notification = { type: 'Event' } // Should be a NotificationType
    await expect(insertNotification(notification)).rejects.toThrow(
      `${serverStrings.errors.notificationError} string`
    )
  })

  test('Notification inserted using event query strings', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ notification_id: 1 }] })
      .mockResolvedValueOnce({
        rows: [{ user_id: 1 }, { user_id: 2 }, { user_id: 3 }],
      })
      .mockResolvedValueOnce({
        rows: [
          { notification_id: 1, user_id: 1 },
          { notification_id: 1, user_id: 2 },
          { notification_id: 1, user_id: 3 },
        ],
      })

    const result = await insertNotification({
      type: NotificationType.Event,
      id: 10,
      metadata: { message: 'test' },
      userID: 4,
    })

    const insertNotificationQuery =
      'INSERT INTO "notification" (notification_type, event_id, metadata) VALUES ($1, $2, $3) RETURNING *'
    const fetchUsersQuery =
      'SELECT user_route.user_id FROM "user_route" JOIN "event_route" ON user_route.route_id = event_route.route_id WHERE event_route.event_id = $1'
    const insertUserNotificationQuery =
      'INSERT INTO "user_notification" (user_id, notification_id) VALUES ($2, $1), ($3, $1), ($4, $1) RETURNING *'
    expect(db.query).toHaveBeenCalledTimes(3)
    expect(db.query).toHaveBeenNthCalledWith(1, insertNotificationQuery, [
      NotificationType.Event.type,
      10,
      { message: 'test' },
    ])
    expect(db.query).toHaveBeenNthCalledWith(2, fetchUsersQuery, [10])
    expect(db.query).toHaveBeenNthCalledWith(
      3,
      insertUserNotificationQuery,
      [1, 1, 2, 3]
    )
    expect(result).toEqual([
      { notification_id: 1, user_id: 1 },
      { notification_id: 1, user_id: 2 },
      { notification_id: 1, user_id: 3 },
    ])
  })

  test('Notification inserted using route query strings', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ notification_id: 1 }] })
      .mockResolvedValueOnce({
        rows: [{ user_id: 1 }, { user_id: 2 }, { user_id: 3 }],
      })
      .mockResolvedValueOnce({
        rows: [
          { notification_id: 1, user_id: 1 },
          { notification_id: 1, user_id: 2 },
          { notification_id: 1, user_id: 3 },
        ],
      })

    const result = await insertNotification({
      type: NotificationType.Route,
      id: 10,
      metadata: { message: 'test' },
      userID: 4,
    })

    const insertNotificationQuery =
      'INSERT INTO "notification" (notification_type, route_id, metadata) VALUES ($1, $2, $3) RETURNING *'
    const fetchUsersQuery =
      'SELECT user_id FROM "user_route" WHERE route_id = $1'
    const insertUserNotificationQuery =
      'INSERT INTO "user_notification" (user_id, notification_id) VALUES ($2, $1), ($3, $1), ($4, $1) RETURNING *'
    expect(db.query).toHaveBeenCalledTimes(3)
    expect(db.query).toHaveBeenNthCalledWith(1, insertNotificationQuery, [
      NotificationType.Route.type,
      10,
      { message: 'test' },
    ])
    expect(db.query).toHaveBeenNthCalledWith(2, fetchUsersQuery, [10])
    expect(db.query).toHaveBeenNthCalledWith(
      3,
      insertUserNotificationQuery,
      [1, 1, 2, 3]
    )
    expect(result).toEqual([
      { notification_id: 1, user_id: 1 },
      { notification_id: 1, user_id: 2 },
      { notification_id: 1, user_id: 3 },
    ])
  })

  test('Notification inserted using badge query strings', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ notification_id: 1 }] })
      .mockResolvedValueOnce({
        rows: [{ user_id: 1 }, { user_id: 2 }, { user_id: 3 }],
      })
      .mockResolvedValueOnce({
        rows: [
          { notification_id: 1, user_id: 1 },
          { notification_id: 1, user_id: 2 },
          { notification_id: 1, user_id: 3 },
        ],
      })

    const result = await insertNotification({
      type: NotificationType.Badge,
      id: 10,
      metadata: { message: 'test' },
      userID: 4,
    })

    const insertNotificationQuery =
      'INSERT INTO "notification" (notification_type, badge_id, metadata) VALUES ($1, $2, $3) RETURNING *'
    const fetchUsersQuery =
      'SELECT user_id FROM "user_badge" WHERE badge_id = $1'
    const insertUserNotificationQuery =
      'INSERT INTO "user_notification" (user_id, notification_id) VALUES ($2, $1), ($3, $1), ($4, $1) RETURNING *'
    expect(db.query).toHaveBeenCalledTimes(3)
    expect(db.query).toHaveBeenNthCalledWith(1, insertNotificationQuery, [
      NotificationType.Badge.type,
      10,
      { message: 'test' },
    ])
    expect(db.query).toHaveBeenNthCalledWith(2, fetchUsersQuery, [10])
    expect(db.query).toHaveBeenNthCalledWith(
      3,
      insertUserNotificationQuery,
      [1, 1, 2, 3]
    )
    expect(result).toEqual([
      { notification_id: 1, user_id: 1 },
      { notification_id: 1, user_id: 2 },
      { notification_id: 1, user_id: 3 },
    ])
  })

  test('Notification inserted using message query strings', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ notification_id: 1 }] })
      .mockResolvedValueOnce({
        rows: [{ user_id: 1 }, { user_id: 2 }, { user_id: 3 }],
      })
      .mockResolvedValueOnce({
        rows: [
          { notification_id: 1, user_id: 1 },
          { notification_id: 1, user_id: 2 },
          { notification_id: 1, user_id: 3 },
        ],
      })

    const result = await insertNotification({
      type: NotificationType.Message,
      id: 10,
      metadata: { message: 'test' },
      userID: 4,
    })

    const insertNotificationQuery =
      'INSERT INTO "notification" (notification_type, message_id, metadata) VALUES ($1, $2, $3) RETURNING *'
    const fetchUsersQuery =
      'SELECT user_id FROM "user_message" WHERE message_id = $1'
    const insertUserNotificationQuery =
      'INSERT INTO "user_notification" (user_id, notification_id) VALUES ($2, $1), ($3, $1), ($4, $1) RETURNING *'
    expect(db.query).toHaveBeenCalledTimes(3)
    expect(db.query).toHaveBeenNthCalledWith(1, insertNotificationQuery, [
      NotificationType.Message.type,
      10,
      { message: 'test' },
    ])
    expect(db.query).toHaveBeenNthCalledWith(2, fetchUsersQuery, [10])
    expect(db.query).toHaveBeenNthCalledWith(
      3,
      insertUserNotificationQuery,
      [1, 1, 2, 3]
    )
    expect(result).toEqual([
      { notification_id: 1, user_id: 1 },
      { notification_id: 1, user_id: 2 },
      { notification_id: 1, user_id: 3 },
    ])
  })

  test('Insert to user_notification not called if there are no users to be notified', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ notification_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] })

    const result = await insertNotification({
      type: NotificationType.Message,
      id: 10,
      metadata: { message: 'test' },
      userID: 4,
    })

    expect(db.query).toHaveBeenCalledTimes(2)
    expect(result).toEqual([])
  })

  test('Insert to user_notification not called if only user is filtered out', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ notification_id: 1 }] })
      .mockResolvedValueOnce({
        rows: [{ user_id: 1 }],
      })

    const result = await insertNotification({
      type: NotificationType.Message,
      id: 10,
      metadata: { message: 'test' },
      userID: 1,
    })

    expect(db.query).toHaveBeenCalledTimes(2)
    expect(result).toEqual([])
  })

  test('Insert to user_notification not called with user who sent notification', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ notification_id: 1 }] })
      .mockResolvedValueOnce({
        rows: [{ user_id: 1 }, { user_id: 2 }, { user_id: 3 }],
      })
      .mockResolvedValueOnce({
        rows: [
          { notification_id: 1, user_id: 2 },
          { notification_id: 1, user_id: 3 },
        ],
      })

    const result = await insertNotification({
      type: NotificationType.Message,
      id: 10,
      metadata: { message: 'test' },
      userID: 1,
    })

    const insertNotificationQuery =
      'INSERT INTO "notification" (notification_type, message_id, metadata) VALUES ($1, $2, $3) RETURNING *'
    const fetchUsersQuery =
      'SELECT user_id FROM "user_message" WHERE message_id = $1'
    const insertUserNotificationQuery =
      'INSERT INTO "user_notification" (user_id, notification_id) VALUES ($2, $1), ($3, $1) RETURNING *'
    expect(db.query).toHaveBeenCalledTimes(3)
    expect(db.query).toHaveBeenNthCalledWith(1, insertNotificationQuery, [
      NotificationType.Message.type,
      10,
      { message: 'test' },
    ])
    expect(db.query).toHaveBeenNthCalledWith(2, fetchUsersQuery, [10])
    expect(db.query).toHaveBeenNthCalledWith(
      3,
      insertUserNotificationQuery,
      [1, 2, 3]
    )
    expect(result).toEqual([
      { notification_id: 1, user_id: 2 },
      { notification_id: 1, user_id: 3 },
    ])
  })
})

describe('Test viewUserNotification database query', () => {
  beforeEach(() => {
    db.query.mockClear()
  })

  test('Throws error on database error', async () => {
    db.query.mockRejectedValueOnce(new Error('Database error'))
    await expect(viewUserNotification(1, 1)).rejects.toThrow(`Database error`)
  })

  test('Query calls with expected query string', async () => {
    db.query.mockResolvedValue({ rows: [] })
    await viewUserNotification(1, 1)
    // Note that this is due to formatting to make the query readable
    const expectedQuery =
      'UPDATE "user_notification" SET read_at = NOW()\n         WHERE user_id = $1 AND notification_id = $2 AND read_at IS NULL'
    expect(db.query).toHaveBeenCalledWith(expectedQuery, [1, 1])
  })
})

describe('Test viewAllUserNotification database query', () => {
  beforeEach(() => {
    db.query.mockClear()
  })

  test('Throws error on database error', async () => {
    db.query.mockRejectedValueOnce(new Error('Database error'))
    await expect(viewAllUserNotifications(1)).rejects.toThrow(`Database error`)
  })

  test('Query calls with expected query string', async () => {
    db.query.mockResolvedValue({ rows: [] })
    await viewAllUserNotifications(1)
    // Note that this is due to formatting to make the query readable
    const expectedQuery =
      'UPDATE "user_notification" SET read_at = NOW()\n         WHERE user_id = $1 AND read_at IS NULL'
    expect(db.query).toHaveBeenCalledWith(expectedQuery, [1])
  })
})

describe('Test getUserNotifications database query', () => {
  beforeEach(() => {
    db.query.mockClear()
  })

  test('Throws error on database error', async () => {
    db.query.mockRejectedValueOnce(new Error('Database error'))
    await expect(getUserNotifications(1)).rejects.toThrow(`Database error`)
  })

  test('Query calls with expected query string', async () => {
    db.query.mockResolvedValue({ rows: [{ type: 'route' }, { type: 'event' }] })
    const results = await getUserNotifications(1)
    // Note that this is due to formatting to make the query readable
    const expectedQuery =
      'SELECT notification.* FROM "notification"\n         JOIN "user_notification" ON notification.notification_id = user_notification.notification_id\n         WHERE user_notification.user_id = $1 AND user_notification.read_at IS NULL\n         ORDER BY notification.created_at DESC'
    expect(db.query).toHaveBeenCalledWith(expectedQuery, [1])
    expect(results).toEqual([{ type: 'route' }, { type: 'event' }])
  })
})
