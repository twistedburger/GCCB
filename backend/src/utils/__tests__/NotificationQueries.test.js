const { serverStrings } = require('../../../locales/en/serverLocales')
const { insertNotification } = require('../NotificationQueries')

describe('Test insertNotification database query', () => {
  test('Notification type not set throws error', async () => {
    const notification = { metadata: { message: 'new notification' } }
    await expect(insertNotification(notification)).rejects.toThrow(
      `${serverStrings.errors.notificationError} undefined`
    )
  })

  test('Invalid notification type throws error', () => {})

  test('Notification inserted using event query strings', () => {
    jest.mock('../../../db', () => ({
      query: jest
        .fn()
        .mockResolvedValue({ rows: [{ reported: 0 }], rowCount: 0 }),
      pool: {
        connect: jest.fn(),
      },
    }))
  })

  test('Notification inserted using route query strings', () => {})

  test('Notification inserted using badge query strings', () => {})

  test('Notification inserted using message query strings', () => {})

  test('Insertion into user_notification table queried with appropriate query string', () => {})
})
