const db = require('../../db')

describe('Test insertNotification database query', () => {
  jest.mock('../../db', () => ({
    query: jest
      .fn()
      .mockResolvedValue({ rows: [{ reported: 0 }], rowCount: 0 }),
    pool: {
      connect: jest.fn(),
    },
  }))

  test('Notification type not set throws error', () => {
    db.query('')
  })

  test('Invalid notification type throws error', () => {})

  test('Notification inserted using event query strings', () => {})

  test('Notification inserted using route query strings', () => {})

  test('Notification inserted using badge query strings', () => {})

  test('Notification inserted using message query strings', () => {})

  test(
    'Insertion into user_notification table queried with appropriate query string'
  )
})
