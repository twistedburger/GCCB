const request = require('supertest')
const db = require('../db')

jest.mock('express-openid-connect', () => ({
  auth: jest.fn(() => (req, res, next) => {
    req.oidc = {
      user: { sub: '123456', name: 'Test User', email: 'test@example.com' },
      isAuthenticated: true,
    }
    req.isAuthenticated = jest.fn().mockReturnValue(true)
    next()
  }),
}))

jest.mock('../db', () => ({
  query: jest.fn(),
}))

let app = require('../server')

describe('GET /api/events', () => {
  test('should return list of events with creator names', async () => {
    const mockEvents = [
      { id: 1, name: 'Event 1', creator_id: 1, creator_name: 'John Doe' },
      { id: 2, name: 'Event 2', creator_id: 2, creator_name: 'Jane Smith' },
    ]

    db.query.mockImplementation((query, callback) => {
      callback(null, { rows: mockEvents })
    })

    const response = await request(app).get('/api/events')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockEvents)
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.any(Function)
    )
  })

  test('should return 500 when database query fails', async () => {
    db.query.mockImplementation((query, callback) => {
      callback(new Error('Database error'), null)
    })
    const response = await request(app).get('/api/events')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: 'Failed to fetch events' })
  })
})

describe('GET /authenticateUser', () => {
  test('should return false when user not authenticated', async () => {
    const selectUserSpy = jest.spyOn(app, 'selectUser').mockResponse({
      sub: '123456',
      name: 'Test User',
      email: 'test@example.com',
    })
    const mockResponse = { isAuthenticated: false, user: null }
    jest.mock('express-openid-connect', () => ({
      auth: jest.fn(() => (req, res, next) => {
        req.oidc = {
          user: { sub: '123456', name: 'Test User', email: 'test@example.com' },
          isAuthenticated: false,
        }
        req.isAuthenticated = jest.fn().mockReturnValue(false)
        next()
      }),
    }))
    const response = await request(app).get('/authenticateUser')
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockResponse)
    expect(selectUserSpy).toHaveBeenCalledTimes(0)
  })
})

describe('selectUser', () => {})

describe('insertUser', () => {
  test('placeholder insert', () => {
    //TODO
    expect(1 + 2).toBe(3)
  })
})

describe('GET /createNewUser', () => {
  test('placeholder create', () => {
    //TODO
    expect(1 + 2).toBe(3)
  })
})
