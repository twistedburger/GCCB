const request = require('supertest')
const { serverStrings } = require('../../../locales/en/serverLocales')
const app = require('../../../server')
const { selectUser } = require('../UserUtils')
const {
  insertNotification,
  viewUserNotification,
  viewAllUserNotifications,
  getUserNotifications,
} = require('../NotificationQueries')
const { notificationEmitter } = require('../NotificationEndpoints')
const { NotificationType } = require('../../../../shared/NotificationTypes')

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
  id: 123456,
  name: 'Test User',
  email: 'test@example.com',
}

const genericServerError = { error: serverStrings.errors.generic }
const accessDeniedError = { error: serverStrings.errors.accessDenied }
const notificationSendError = {
  error: serverStrings.errors.notificationSendError,
}

describe('/notifications/notify endpoint', () => {
  const notificationToSend = {
    type: NotificationType.Route,
    id: 2,
    metadata: { message: 'test' },
  }

  beforeEach(() => {
    mockIsAuthenticated.mockClear()
    selectUser.mockReset()
    insertNotification.mockReset()
  })

  test('Return 403 if user is not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    const response = await request(app)
      .post('/notifications/notify')
      .send(notificationToSend)

    expect(response.status).toBe(403)
    expect(insertNotification).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual(accessDeniedError)
  })

  test('Return 500 if user is not in database', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockReturnValue(null)
    const response = await request(app)
      .post('/notifications/notify')
      .send(notificationToSend)

    expect(response.status).toBe(500)
    expect(insertNotification).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 500 if selectUser throws error', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockRejectedValue(new Error('oops'))
    const response = await request(app)
      .post('/notifications/notify')
      .send(notificationToSend)

    expect(response.status).toBe(500)
    expect(insertNotification).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 500 if insertNotification throws a notification error', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockResolvedValue(expectedAuthorizedUser)
    insertNotification.mockRejectedValue(
      new Error(serverStrings.errors.notificationError)
    )
    const response = await request(app)
      .post('/notifications/notify')
      .send(notificationToSend)

    expect(response.status).toBe(500)
    expect(insertNotification).toHaveBeenCalledTimes(1)
    expect(response.body).toEqual(notificationSendError)
  })

  test('Return 500 if insertNotification throws a generic error', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockResolvedValue(expectedAuthorizedUser)
    insertNotification.mockRejectedValue(new Error('oops'))
    const response = await request(app)
      .post('/notifications/notify')
      .send(notificationToSend)

    expect(response.status).toBe(500)
    expect(insertNotification).toHaveBeenCalledTimes(1)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 200 on success and emits notifications', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockResolvedValue(expectedAuthorizedUser)
    insertNotification.mockResolvedValue([{ user_id: 123456 }])
    const emitSpy = jest.spyOn(notificationEmitter, 'emit')

    const response = await request(app)
      .post('/notifications/notify')
      .send(notificationToSend)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ success: true })
    expect(emitSpy).toHaveBeenCalledWith('notification', [{ user_id: 123456 }])
  })
})

describe('/notifications/clearNotifications endpoint', () => {
  beforeEach(() => {
    mockIsAuthenticated.mockClear()
    selectUser.mockReset()
    viewUserNotification.mockReset()
    viewAllUserNotifications.mockReset()
  })

  test('Return 403 if user is not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    const response = await request(app)
      .patch('/notifications/clearNotifications')
      .send({ all: true })

    expect(response.status).toBe(403)
    expect(viewUserNotification).toHaveBeenCalledTimes(0)
    expect(viewAllUserNotifications).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual(accessDeniedError)
  })

  test('Return 500 if user is not in database', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockReturnValue(null)
    const response = await request(app)
      .patch('/notifications/clearNotifications')
      .send({ all: true })

    expect(response.status).toBe(500)
    expect(viewUserNotification).toHaveBeenCalledTimes(0)
    expect(viewAllUserNotifications).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 500 if selectUser throws error', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockRejectedValue(new Error('oops'))
    const response = await request(app)
      .patch('/notifications/clearNotifications')
      .send({ all: true })

    expect(response.status).toBe(500)
    expect(viewUserNotification).toHaveBeenCalledTimes(0)
    expect(viewAllUserNotifications).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 500 if viewAllUserNotifications throws error', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockResolvedValue(expectedAuthorizedUser)
    viewAllUserNotifications.mockRejectedValue(new Error('oops'))
    const response = await request(app)
      .patch('/notifications/clearNotifications')
      .send({ all: true })

    expect(response.status).toBe(500)
    expect(viewUserNotification).toHaveBeenCalledTimes(0)
    expect(viewAllUserNotifications).toHaveBeenCalledTimes(1)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 500 if viewUserNotification throws error', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockResolvedValue(expectedAuthorizedUser)
    viewUserNotification.mockRejectedValue(new Error('oops'))
    const response = await request(app)
      .patch('/notifications/clearNotifications')
      .send({ all: false, notificationID: 42 })

    expect(response.status).toBe(500)
    expect(viewUserNotification).toHaveBeenCalledTimes(1)
    expect(viewAllUserNotifications).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 200 when clearing all notifications', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockResolvedValue(expectedAuthorizedUser)
    viewAllUserNotifications.mockResolvedValue()
    const response = await request(app)
      .patch('/notifications/clearNotifications')
      .send({ all: true })

    expect(response.status).toBe(200)
    expect(viewAllUserNotifications).toHaveBeenCalledWith(123456)
    expect(viewUserNotification).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual({ success: true })
  })

  test('Return 200 when clearing a single notification', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockResolvedValue(expectedAuthorizedUser)
    viewUserNotification.mockResolvedValue()

    const response = await request(app)
      .patch('/notifications/clearNotifications')
      .send({ all: false, notificationID: 42 })

    expect(response.status).toBe(200)
    expect(viewUserNotification).toHaveBeenCalledWith(123456, 42)
    expect(viewAllUserNotifications).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual({ success: true })
  })
})

describe('/notifications/listenForNotifications endpoint', () => {
  beforeEach(() => {
    mockIsAuthenticated.mockClear()
  })

  test('Return 403 if user is not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    const response = await request(app).get(
      '/notifications/listenForNotifications'
    )

    expect(response.status).toBe(403)
    expect(response.body).toEqual(accessDeniedError)
  })
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
    expect(getUserNotifications).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual(accessDeniedError)
  })

  test('Return 500 if user is not in database', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockReturnValue(null)
    const response = await request(app).get('/notifications/getNotifications')

    expect(response.status).toBe(500)
    expect(getUserNotifications).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 500 if selectUser throws error', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockRejectedValue(new Error('oops'))
    const response = await request(app).get('/notifications/getNotifications')

    expect(response.status).toBe(500)
    expect(getUserNotifications).toHaveBeenCalledTimes(0)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 500 if getUserNotifications failed', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockReturnValue(expectedAuthorizedUser)
    getUserNotifications.mockRejectedValue(new Error('oops'))

    const response = await request(app).get('/notifications/getNotifications')

    expect(response.status).toBe(500)
    expect(getUserNotifications).toHaveBeenCalledTimes(1)
    expect(response.body).toEqual(genericServerError)
  })

  test('Return 200 and notifications on success with notifications', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    selectUser.mockReturnValue(expectedAuthorizedUser)
    getUserNotifications.mockReturnValue([{ notificationID: 1 }])

    const response = await request(app).get('/notifications/getNotifications')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      notifications: [{ notificationID: 1 }],
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
