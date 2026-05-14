const { selectUser } = require('../UserUtils')
const { getUserNotifications } = require('../../services/NotificationServices')
const { handleNotifications } = require('../NotificationUtils')
const { serverStrings } = require('../../../locales/en/serverLocales')

jest.mock('../UserUtils', () => ({
  selectUser: jest.fn(),
}))

jest.mock('../../services/NotificationServices', () => ({
  getUserNotifications: jest.fn(),
}))

describe('Notification handler utils', () => {
  let mockReq, mockRes

  beforeEach(() => {
    selectUser.mockReset()
    getUserNotifications.mockReset()
    mockReq = null
    mockRes = {
      setHeader: jest.fn(),
      write: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
  })

  test('writes notifications to stream when user matches', async () => {
    selectUser.mockResolvedValue({ id: 1 })
    getUserNotifications.mockResolvedValue([{ notification_id: 1 }])

    const handler = handleNotifications(mockReq, mockRes)
    await handler([{ user_id: 1 }])

    expect(mockRes.write).toHaveBeenCalledWith(
      `data: ${JSON.stringify({ notifications: [{ notification_id: 1 }] })}\n\n`
    )
  })

  test('does not write if user is not in usersToNotify', async () => {
    selectUser.mockResolvedValue({ id: 99 })

    const handler = handleNotifications(mockReq, mockRes)
    await handler([{ user_id: 1 }])

    expect(mockRes.write).not.toHaveBeenCalled()
  })

  test('writes error to stream if selectUser throws', async () => {
    selectUser.mockRejectedValue(new Error('oops'))

    const handler = handleNotifications(mockReq, mockRes)
    await handler([{ user_id: 1 }])

    expect(mockRes.write).toHaveBeenCalledWith(
      `data: ${JSON.stringify({ error: serverStrings.errors.generic })}\n\n`
    )
  })

  test('writes error to stream if user is null', async () => {
    selectUser.mockResolvedValue(null)

    const handler = handleNotifications(mockReq, mockRes)
    await handler([{ user_id: 1 }])

    expect(mockRes.write).toHaveBeenCalledWith(
      `data: ${JSON.stringify({ error: serverStrings.errors.generic })}\n\n`
    )
  })
})
