const request = require('supertest')
const { serverStrings } = require('../../../locales/en/serverLocales')
const { app } = require('../../../server')
const { selectUser } = require('../UserUtils')
const {
  /*insertNotification, viewUserNotification, viewAllUserNotifications,*/ getUserNotifications,
} = require('../NotificationQueries')

global.fetch = jest.fn()

let mockIsAuthenticated = jest.fn().mockReturnValue(true)

jest.mock('express-openid-connect', () => ({
  auth: jest.fn(() => (req, res, next) => {
    req.oidc = {
      user: { id: '123456', name: 'Test User', email: 'test@example.com' },
      isAuthenticated: mockIsAuthenticated,
    }
    req.isAuthenticated = mockIsAuthenticated
    next()
  }),
}))

jest.mock('../UserUtils', () => ({
  selectUser: jest.fn(),
}))

jest.mock('../NotificationQueries', () => ({
  insertNotification: jest.fn(),
  viewUserNotification: jest.fn(),
  viewAllUserNotifications: jest.fn(),
  getUserNotifications: jest.fn(),
}))

const expectedAuthorizedUser = {
  id: '123456',
  name: 'Test User',
  email: 'test@example.com',
}

const genericServerError = { error: serverStrings.errors.generic }
const accessDeniedError = { error: serverStrings.errors.accessDenied }

describe('/notifications/notify endpoint', () => {
  test('', () => {})
})

describe('/notifications/clearNotifications endpoint', () => {
  test('', () => {})
})

describe('/notifications/listenForNotifications endpoint', () => {
  test('', () => {})
})

describe('/notifications/getNotifications endpoint', () => {
  beforeEach(() => {
    mockIsAuthenticated.mockClear()
    selectUser.mockReset()
    getUserNotifications.mockReset()
  })

  test('Return 403 if user is not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    const response = await request(app).get('/notifications/getNotifications')

    expect(response.status).toBe(403)
    expect(response.body).toEqual(accessDeniedError)
  })

  test('Return 500 if user is not in database', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockReturnValue(null)
    const response = await request(app).get('/notifications/getNotifications')

    expect(response.status).toBe(500)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 500 if selectUser throws error', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockRejectedValue(new Error('oops'))
    const response = await request(app).get('/notifications/getNotifications')

    expect(response.status).toBe(500)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 500 if getUserNotifications failed', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockReturnValue(expectedAuthorizedUser)
    getUserNotifications.mockRejectedValue(new Error('oops'))

    const response = await request(app).get('/notifications/getNotifications')

    expect(response.status).toBe(500)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 200 and notifications on success with notifications', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockReturnValue(expectedAuthorizedUser)
    getUserNotifications.mockReturnValue([{ notification: 'notification' }])

    const response = await request(app).get('/notifications/getNotifications')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      notifications: [{ notification: 'notification' }],
    })
  })

  test('Return 200 and notifications on success with no notifications', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockReturnValue(expectedAuthorizedUser)
    getUserNotifications.mockReturnValue([])

    const response = await request(app).get('/notifications/getNotifications')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ notifications: [] })
  })
})
