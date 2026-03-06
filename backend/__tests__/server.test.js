const request = require('supertest')
const db = require('../db')

global.fetch = jest.fn()

let mockIsAuthenticated = jest.fn().mockReturnValue(true)
jest.mock('express-openid-connect', () => ({
  auth: jest.fn(() => (req, res, next) => {
    req.oidc = {
      user: { sub: '123456', name: 'Test User', email: 'test@example.com' },
      isAuthenticated: mockIsAuthenticated,
    }
    req.isAuthenticated = mockIsAuthenticated
    next()
  }),
}))

const expectedAuthorizedUser = {
  sub: '123456',
  name: 'Test User',
  email: 'test@example.com',
}

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
  })
})

describe('GET /authenticateUser', () => {
  // note the following tests inherently test the functionality of selectUser
  const mockUser = [{ id: 1, name: 'John Doe' }]
  const mockNoUser = []

  beforeEach(() => {
    mockIsAuthenticated.mockClear()
  })

  test('should return false when user not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    db.query.mockImplementation((query, callback) => {
      callback(null, { rows: mockNoUser })
    })
    const mockResponse = { isAuthenticated: false, user: null }

    const response = await request(app).get('/authenticateUser')
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockResponse)
    expect(db.query).not.toHaveBeenCalledWith()
  })

  test('should return true with null user when user is authenticated, but not in database', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    db.query.mockResolvedValue({ rows: mockNoUser, rowCount: 0 })

    const response = await request(app).get('/authenticateUser')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      isAuthenticated: true,
      user: null,
      ssoProfile: expectedAuthorizedUser,
    })
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.any(Array)
    )
  })

  test('should return true with user when authenticated and in database', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    db.query.mockResolvedValue({ rows: mockUser, rowCount: 1 })

    const response = await request(app).get('/authenticateUser')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      isAuthenticated: true,
      user: mockUser[0],
      ssoProfile: null,
    })
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.any(Array)
    )
  })

  test('should return error 500 if database causes an error', async () => {
    db.query.mockImplementation((query, callback) => {
      callback(new Error('Database error'), null)
    })
    const response = await request(app).get('/authenticateUser')
    expect(response.status).toBe(500)
  })
})

describe('GET /maps/api/js', () => {
  beforeEach(() => {
    fetch.mockClear()
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key'
  })

  test('returns script content with correct content-type', async () => {
    fetch.mockResolvedValue({
      text: jest.fn().mockResolvedValue('console.log("maps");'),
    })

    const response = await request(app).get('/maps/api/js')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('application/javascript')
    expect(response.text).toBe('console.log("maps");')
  })

  test('injects API key into Google request', async () => {
    fetch.mockResolvedValue({
      text: jest.fn().mockResolvedValue(''),
    })

    await request(app).get('/maps/api/js?callback=initMap')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('key=test-api-key')
    )
  })

  test('forwards query params to Google', async () => {
    fetch.mockResolvedValue({
      text: jest.fn().mockResolvedValue(''),
    })

    await request(app).get('/maps/api/js?callback=initMap')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('callback=initMap')
    )
  })
})

describe('GET /maps/geocode', () => {
  beforeEach(() => {
    fetch.mockClear()
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key'
  })

  test('returns geocode data as JSON', async () => {
    const mockData = {
      results: [{ formatted_address: '123 Main St' }],
      status: 'OK',
    }
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockData),
    })

    const response = await request(app).get('/maps/geocode?address=123+Main+St')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockData)
  })

  test('passes address param to Google', async () => {
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    })

    await request(app).get('/maps/geocode?address=123+Main+St')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('address=123+Main+St')
    )
  })

  test('injects API key into Google request', async () => {
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    })

    await request(app).get('/maps/geocode?address=test')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('key=test-api-key')
    )
  })
})

//@Todo - Update these tests to new profile creation
/*
describe('GET /createNewUser', () => {
  // note the following tests inherently test the functionality of createUser and selectUser
  const mockUser = [{ id: 1, name: 'John Doe' }]
  const mockNoUser = []

  beforeEach(() => {
    mockIsAuthenticated.mockClear()
  })

  test('should return 403 error when user not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    db.query.mockImplementation((query, callback) => {
      callback(null, { rows: mockNoUser })
    })
    const response = await request(app).get('/createNewUser')
    expect(response.status).toBe(403)
    expect(db.query).not.toHaveBeenCalledWith()
  })

  test('should return new user when user is authenticated, but not in database', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    db.query.mockResolvedValueOnce({ rows: mockNoUser, rowCount: 0 })
    db.query.mockResolvedValueOnce({ rows: mockUser, rowCount: 1 })

    const response = await request(app).get('/createNewUser')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ user: mockUser[0] })
    expect(db.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('SELECT'),
      expect.any(Array)
    )
    expect(db.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT'),
      expect.any(Array)
    )
  })

  test('should return user when authenticated and in database', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    db.query.mockResolvedValue({ rows: mockUser, rowCount: 1 })

    const response = await request(app).get('/createNewUser')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ user: mockUser[0] })
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.any(Array)
    )
    expect(db.query).toHaveBeenCalledTimes(1)
  })

  test('should return error 500 if database causes an error', async () => {
    db.query.mockImplementation((query, callback) => {
      callback(new Error('Database error'), null)
    })
    const response = await request(app).get('/createNewUser')
    expect(response.status).toBe(500)
  })
})
*/
describe('GET /authorize', () => {
  const mockUser = [{ id: 1, name: 'John Doe', role: 'user' }]
  const mockAdmin = [{ id: 1, name: 'John Doe', role: 'admin' }]
  const mockNoUser = []

  beforeEach(() => {
    mockIsAuthenticated.mockClear()
  })

  test('should return 403 error when user not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    db.query.mockImplementation((query, callback) => {
      callback(null, { rows: mockNoUser })
    })
    const response = await request(app).get('/authorize')
    expect(response.status).toBe(403)
    expect(db.query).not.toHaveBeenCalledWith()
  })

  test('should return user authorization when user is authenticated, but not in database', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    db.query.mockResolvedValue({ rows: mockNoUser, rowCount: 0 })

    const response = await request(app).get('/authorize')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ authorization: 'user' })
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.any(Array)
    )
  })

  test('should return user authorization when authenticated and in database', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    db.query.mockResolvedValue({ rows: mockUser, rowCount: 1 })

    const response = await request(app).get('/authorize')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ authorization: 'user' })
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.any(Array)
    )
  })

  test('should return admin authorization when authenticated and in database for admin', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    db.query.mockResolvedValue({ rows: mockAdmin, rowCount: 1 })

    const response = await request(app).get('/authorize')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ authorization: 'admin' })
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.any(Array)
    )
  })
  test('should return error 500 if database causes an error', async () => {
    db.query.mockImplementation((query, callback) => {
      callback(new Error('Database error'), null)
    })
    const response = await request(app).get('/authorize')
    expect(response.status).toBe(500)
  })
})

describe('GET /api/routes', () => {
  test('should return list of routes with people going count', async () => {
    const mockRoutes = [
      { id: 1, name: 'Route 1', people_going: 3 },
      { id: 2, name: 'Route 2', people_going: 0 },
    ]

    db.query.mockImplementation((query, callback) => {
      callback(null, { rows: mockRoutes })
    })

    const response = await request(app).get('/api/routes')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockRoutes)
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.any(Function)
    )
  })

  test('should return 500 when database query fails', async () => {
    db.query.mockImplementation((query, callback) => {
      callback(new Error('Database error'), null)
    })

    const response = await request(app).get('/api/routes')

    expect(response.status).toBe(500)
  })
})

describe('GET /sso_list', () => {
  const mockSSOs = [
    { id: 1, school_name: 'University of BC', school_nickname: 'UBC' },
    { id: 2, school_name: 'Simon Fraser University', school_nickname: 'SFU' },
  ]

  beforeEach(() => {
    db.query.mockClear()
  })

  test('should return list of SSOs', async () => {
    db.query.mockResolvedValue({ rows: mockSSOs })

    const response = await request(app).get('/sso_list')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockSSOs)
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.any(Array)
    )
  })

  test('should filter results when search query is provided', async () => {
    const mockFiltered = [mockSSOs[0]]
    db.query.mockResolvedValue({ rows: mockFiltered })

    const response = await request(app).get('/sso_list?search=UBC')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockFiltered)
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [
      '%UBC%',
    ])
  })

  test('should use empty string when no search query provided', async () => {
    db.query.mockResolvedValue({ rows: mockSSOs })

    await request(app).get('/sso_list')

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [
      '%%',
    ])
  })

  test('should return 500 when database query fails', async () => {
    db.query.mockRejectedValue(new Error('Database error'))

    const response = await request(app).get('/sso_list')

    expect(response.status).toBe(500)
  })
})
