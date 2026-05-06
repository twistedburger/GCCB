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
  query: jest.fn().mockResolvedValue({ rows: [{ reported: 0 }], rowCount: 0 }), // mocks unbanned user, reported < 3
  pool: {
    connect: jest.fn(),
  },
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
    mockIsAuthenticated.mockReturnValue(true)
    fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('console.log("maps");'),
    })

    const response = await request(app).get('/maps/api/js')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('application/javascript')
    expect(response.text).toBe('console.log("maps");')
  })

  test('injects API key into Google request', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    fetch.mockResolvedValue({
      text: jest.fn().mockResolvedValue(''),
    })

    await request(app).get('/maps/api/js?callback=initMap')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('key=test-api-key')
    )
  })

  test('forwards query params to Google', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    fetch.mockResolvedValue({
      text: jest.fn().mockResolvedValue(''),
    })

    await request(app).get('/maps/api/js?callback=initMap')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('callback=initMap')
    )
  })

  test('returns 500 when fetch fails', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    fetch.mockRejectedValue(new Error('Network failure'))

    const response = await request(app).get('/maps/api/js')

    expect(response.status).toBe(500)
  })

  test('handles non-ok response from Google', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    fetch.mockResolvedValue({
      ok: false,
      status: 403,
    })

    const response = await request(app).get('/maps/api/js')

    expect(response.status).toBe(403)
  })

  test('returns reponse 403 if user is not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    const response = await request(app).get('/maps/api/js')

    expect(response.status).toBe(403)
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

describe('POST /api/createRoute', () => {
  test('should return 403 if user is not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    const response = await request(app).post('/api/createRoute').send({})
    expect(response.status).toBe(403)
  })

  let mockClient

  beforeEach(() => {
    mockIsAuthenticated.mockReturnValue(true)

    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    }

    db.pool.connect.mockResolvedValue(mockClient)
    db.query.mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 })
  })

  test('should always release client even on failure', async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error('DB down'))

    await request(app).post('/api/createRoute').send({ title: 'Test' })

    expect(mockClient.release).toHaveBeenCalledTimes(1)
  })

  test('should create route and link to event (isJoined: false)', async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 101 }] }) // INSERT route
      .mockResolvedValueOnce({}) // INSERT event_route
      .mockResolvedValueOnce({}) // COMMIT

    const response = await request(app)
      .post('/api/createRoute')
      .send({ event_id: 5, title: 'Morning Commute', isJoined: false })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ success: true, route_id: 101 })
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('BEGIN')
    )
    expect(mockClient.release).toHaveBeenCalled()
  })

  test('should insert into user_route if isJoined is true', async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 102 }] }) // INSERT route
      .mockResolvedValueOnce({}) // INSERT event_route
      .mockResolvedValueOnce({}) // INSERT user_route
      .mockResolvedValueOnce({}) // COMMIT

    const response = await request(app)
      .post('/api/createRoute')
      .send({ event_id: 5, title: 'Joined Route', isJoined: true })

    expect(response.status).toBe(201)

    const userRouteCall = mockClient.query.mock.calls.find(call =>
      call[0].includes('INSERT INTO user_route')
    )
    expect(userRouteCall).toBeDefined()
    expect(userRouteCall[1]).toEqual([1, 102])
  })

  test('should rollback and return 500 on route insert failure', async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error('Transaction Error')) // INSERT route fails

    const response = await request(app)
      .post('/api/createRoute')
      .send({ title: 'Broken Route' })

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Failed to create and link route')
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('ROLLBACK')
    )
    expect(mockClient.release).toHaveBeenCalled()
  })

  test('should rollback and return 500 on event_route insert failure', async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 104 }] }) // INSERT route succeeds
      .mockRejectedValueOnce(new Error('FK violation')) // INSERT event_route fails

    const response = await request(app)
      .post('/api/createRoute')
      .send({ event_id: 999, title: 'Orphan Route', isJoined: false })

    expect(response.status).toBe(500)
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('ROLLBACK')
    )
  })

  test('should rollback and return 500 on user_route insert failure (isJoined: true)', async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 105 }] }) // INSERT route
      .mockResolvedValueOnce({}) // INSERT event_route
      .mockRejectedValueOnce(new Error('user_route failed')) // INSERT user_route fails

    const response = await request(app)
      .post('/api/createRoute')
      .send({ event_id: 5, title: 'Test', isJoined: true })

    expect(response.status).toBe(500)
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('ROLLBACK')
    )
    expect(mockClient.release).toHaveBeenCalledTimes(1)
  })
})

describe('POST /api/createEvent', () => {
  const standardDbUser = { id: 1, role: 'user' }
  const moderatorDbUser = { id: 2, role: 'moderator' }

  beforeEach(() => {
    mockIsAuthenticated.mockReturnValue(true)
  })

  test('should return 403 if user is not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    const response = await request(app).post('/api/createEvent').send({})
    expect(response.status).toBe(403)
  })

  test('should create event and return 201 with event data', async () => {
    const mockEvent = { id: 10, title: 'Morning Ride' }

    db.query.mockResolvedValueOnce({ rows: [standardDbUser], rowCount: 1 })
    db.query.mockResolvedValueOnce({ rows: [mockEvent] })

    const response = await request(app).post('/api/createEvent').send({
      title: 'Morning Ride',
      event_time: '2026-04-15T08:00:00Z',
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(mockEvent)
  })

  test('should set verified to true if creator is a moderator', async () => {
    db.query.mockResolvedValueOnce({ rows: [moderatorDbUser] })
    db.query.mockResolvedValueOnce({ rows: [{ id: 99 }] })

    await request(app).post('/api/createEvent').send({ title: 'Mod Event' })

    const insertCall = db.query.mock.calls.find(call =>
      call[0].includes('INSERT INTO event')
    )
    expect(insertCall[1][4]).toBe(true)
  })

  test('should set verified to false if creator is not a moderator', async () => {
    db.query.mockResolvedValueOnce({ rows: [standardDbUser] })
    db.query.mockResolvedValueOnce({ rows: [{ id: 100 }] })

    await request(app).post('/api/createEvent').send({ title: 'User Event' })

    const insertCall = db.query.mock.calls.find(call =>
      call[0].includes('INSERT INTO event')
    )
    expect(insertCall[1][4]).toBe(false)
  })

  test('should pass correct parameters to db.query', async () => {
    const payload = {
      title: 'Param Check',
      event_time: '2026-04-15T12:00:00Z',
      location: 'Burnaby',
      need_approval: false,
      description: 'Testing params',
    }

    db.query.mockResolvedValueOnce({ rows: [standardDbUser] })
    db.query.mockResolvedValueOnce({ rows: [{ id: 101 }] })

    await request(app).post('/api/createEvent').send(payload)

    const insertCall = db.query.mock.calls.find(call =>
      call[0].includes('INSERT INTO event')
    )
    const [query, params] = insertCall

    expect(query).toContain('RETURNING *')
    expect(params[0]).toBe(payload.title)
    expect(params[1]).toBe(1)
    expect(params[7]).toBeInstanceOf(Date)
  })

  test('should return 500 on db.query failure', async () => {
    db.query.mockResolvedValueOnce({ rows: [standardDbUser] }) // works
    db.query.mockRejectedValueOnce(new Error('DB connection lost'))

    const response = await request(app)
      .post('/api/createEvent')
      .send({ title: 'Fail' })

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: 'Internal Server Error' })
  })
})

// Tests for POST /api/report — report submission for events, users, and routes
describe('POST /api/report', () => {
  const mockUser = { id: 1, name: 'John Doe', role: 'user' } // create mock user table

  beforeEach(() => {
    mockIsAuthenticated.mockReturnValue(true)
    db.query.mockReset()
  })

  test('should return 403 when user is not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    const response = await request(app).post('/api/report').send({
      type: 'event',
      targetId: 1,
      reason: 'Spam or Misleading Information',
      explanation: 'This is spam',
    })
    expect(response.status).toBe(403)
  })

  test('should insert into report table for an event', async () => {
    db.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 }) // mocks selectUser to define who is submitting a report
    db.query.mockResolvedValueOnce({ rows: [{ id: 99 }] }) // mocks insert into report table, returns report_id

    const response = await request(app).post('/api/report').send({
      type: 'event',
      targetId: 1,
      reason: 'Spam or Misleading Information',
      explanation: 'This is spam',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ success: true })
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO report'), // verifies report table was inserted into
      expect.arrayContaining([
        99,
        'Spam or Misleading Information',
        'This is spam',
        'event',
        1,
      ]) // verifies correct information is being inserted into report table
    )
  })

  test('should insert into report table for a user', async () => {
    db.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })
    db.query.mockResolvedValueOnce({ rows: [{ id: 99 }] })

    const response = await request(app).post('/api/report').send({
      type: 'user',
      targetId: 2,
      reason: 'Other',
      explanation: 'Rude behavior',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ success: true })
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO report'),
      expect.arrayContaining([99, 'Other', 'Rude behavior', 'user', 2])
    )
  })

  test('should insert into report table for a route', async () => {
    db.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })
    db.query.mockResolvedValueOnce({ rows: [{ id: 99 }] })

    const response = await request(app).post('/api/report').send({
      type: 'route',
      targetId: 3,
      reason: 'Dangerous Activity',
      explanation: 'Dangerous route',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ success: true })
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO report'),
      expect.arrayContaining([
        99,
        'Dangerous Activity',
        'Dangerous route',
        'route',
        3,
      ])
    )
  })

  test('should store the correct reason and explanation', async () => {
    db.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })
    db.query.mockResolvedValueOnce({ rows: [{ id: 99 }] })

    await request(app).post('/api/report').send({
      type: 'event',
      targetId: 1,
      reason: 'Inappropriate Content',
      explanation: 'Bad content',
    })

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO report'),
      expect.arrayContaining(['Inappropriate Content', 'Bad content'])
    )
  })

  test('should return 400 on duplicate report', async () => {
    db.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })
    const duplicateError = new Error('duplicate')
    duplicateError.code = '23505'
    db.query.mockRejectedValueOnce(duplicateError)

    const response = await request(app).post('/api/report').send({
      type: 'event',
      targetId: 1,
      reason: 'Spam or Misleading Information',
      explanation: 'This is spam',
    })

    expect(response.status).toBe(400)
  })

  test('should return 500 when inserting report fails', async () => {
    db.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })
    db.query.mockRejectedValueOnce(new Error('Database error'))

    const response = await request(app).post('/api/report').send({
      type: 'event',
      targetId: 1,
      reason: 'Spam or Misleading Information',
      explanation: 'This is spam',
    })

    expect(response.status).toBe(500)
  })

  test('should auto-approve report and increment reported count when submitted by a moderator', async () => {
    const mockModerator = { id: 1, name: 'Mod', role: 'moderator' }
    db.query.mockResolvedValueOnce({ rows: [{ reported: 0 }] })
    db.query.mockResolvedValueOnce({ rows: [mockModerator], rowCount: 1 })
    db.query.mockResolvedValueOnce({ rows: [{ id: 99, target_id: 1 }] })
    db.query.mockResolvedValueOnce({ rows: [] })
    db.query.mockResolvedValueOnce({ rows: [] })

    const response = await request(app).post('/api/report').send({
      type: 'event',
      targetId: 1,
      reason: 'Inappropriate Content',
      explanation: 'Bad content',
    })

    expect(response.status).toBe(200)
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE report SET status'),
      expect.arrayContaining(['approved', 99])
    )
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('reported = reported + 1'),
      expect.arrayContaining([1])
    )
  })
})
