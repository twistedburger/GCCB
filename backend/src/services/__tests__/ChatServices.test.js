const { pool } = require('../../../db.js')
const chatService = require('../ChatServices.js')
const {
  chatServiceStrings,
} = require('../../../locales/en/services/ChatServicesLocales.js')

jest.mock('../../../db.js', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}))

describe('ChatServices', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getRoomMembers', () => {
    it('should return member list on success', async () => {
      const mockRows = [
        { id: 1, nickname: 'Alice' },
        { id: 2, nickname: 'Bob' },
      ]
      pool.query.mockResolvedValueOnce({ rows: mockRows })

      const result = await chatService.getRoomMembers(101)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRows)
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [101]
      )
    })

    it('should return failure on database error', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB Error'))

      const result = await chatService.getRoomMembers(101)

      expect(result.success).toBe(false)
      expect(result.error).toBe(chatServiceStrings.errors.fetchRooms)
    })
  })

  describe('performRoomCleanup (Transaction Test)', () => {
    let mockClient

    beforeEach(() => {
      mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      }
      pool.connect.mockResolvedValue(mockClient)
    })

    it('should commit transaction on successful cleanup', async () => {
      await chatService.performRoomCleanup()

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN')
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT')
      expect(mockClient.release).toHaveBeenCalled()
    })

    it('should rollback and throw on failure', async () => {
      mockClient.query.mockImplementation(sql => {
        if (sql.includes('UPDATE')) throw new Error('Cleanup Failed')
      })

      await expect(chatService.performRoomCleanup()).rejects.toThrow(
        'Cleanup Failed'
      )
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK')
      expect(mockClient.release).toHaveBeenCalled()
    })
  })

  describe('verifyMembership', () => {
    it('should return isMember: false if no row found', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 })

      const result = await chatService.verifyMembership(1, 101)

      expect(result.isMember).toBe(false)
    })

    it('should return isMember: true and room status if found', async () => {
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ is_closed: true }],
      })

      const result = await chatService.verifyMembership(1, 101)

      expect(result.isMember).toBe(true)
      expect(result.is_closed).toBe(true)
    })
  })

  describe('saveMessage', () => {
    it('should return new message object with sender nickname', async () => {
      const mockMsg = {
        id: 1,
        chatroom_id: 101,
        sender_id: 5,
        content: 'Hi',
        sent_at: 'now',
      }
      const mockUser = { nickname: 'John' }

      // insert message
      pool.query.mockResolvedValueOnce({ rows: [mockMsg] })
      // get nickname
      pool.query.mockResolvedValueOnce({ rows: [mockUser] })

      const result = await chatService.saveMessage(101, 5, 'Hi')

      expect(result.success).toBe(true)
      expect(result.data.senderNickname).toBe('John')
      expect(result.data.content).toBe('Hi')
    })
  })

  describe('createNewRoom', () => {
    it('should create room and add user using the provided client', async () => {
      const mockClient = { query: jest.fn() }
      const mockRoomId = 999

      mockClient.query.mockResolvedValueOnce({ rows: [{ id: mockRoomId }] })
      mockClient.query.mockResolvedValueOnce({})
      mockClient.query.mockResolvedValueOnce({
        rows: [{ id: 1, nickname: 'Dev' }],
      }) // SELECT user

      const result = await chatService.createNewRoom(
        mockClient,
        50,
        1,
        '2026-12-31'
      )

      expect(result.success).toBe(true)
      expect(result.chatroomId).toBe(mockRoomId)
    })
  })
})
