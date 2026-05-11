const express = require('express')
const router = express.Router()
const chatService = require('../src/service/chat.service')
const requireAuth = require('../middleware/requireAuth')
const { selectUser } = require('../src/utils/UserUtils')

/**
 * Fetches all chat rooms for the authenticated user.
 * Also performs cleanup of expired/archived rooms before fetching.
 */
router.get('/rooms', requireAuth, async (req, res) => {
  const user = await selectUser(req)
  await chatService.performRoomCleanup()

  const result = await chatService.getRoomsByUserId(user.id)
  if (!result.success) return res.status(500).json({ error: result.error })

  res.json(result.data)
})

/**
 * Fetches full details for a specific chat room, including messages and members.
 */
router.get('/rooms/:id', requireAuth, async (req, res) => {
  const user = await selectUser(req)
  const roomId = req.params.id

  const membership = await chatService.verifyMembership(user.id, roomId)
  if (!membership.isMember)
    return res.status(403).json({ error: membership.error })
  if (!membership.success)
    return res.status(500).json({ error: membership.error })

  const result = await chatService.getRoomFullDetails(roomId)
  if (!result.success) return res.status(500).json({ error: result.error })

  res.json(result.data)
})

/**
 * Creates a new chat room for a given route.
 */
router.post('/rooms', requireAuth, async (req, res) => {
  const result = await chatService.createNewRoom(req.body.route_id)
  if (!result.success) return res.status(500).json({ error: result.error })

  res.status(201).json(result.data)
})

module.exports = router
