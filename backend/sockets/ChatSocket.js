const { Server } = require('socket.io')
const chatService = require('../src/services/ChatServices')
const { chatSocketStrings } = require('../locales/en/socket/ChatSocketLocales')

let io

/**
 * Initializes the Socket.IO server and sets up event handlers for chat functionality.
 * Listens for 'AUTH' events to authenticate users and 'SEND_MESSAGE' events to handle incoming messages.
 *
 * @param {import('http').Server} httpServer The HTTP server instance
 * @returns {import('socket.io').Server}
 */
const initSocket = httpServer => {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  })

  io.on('connection', socket => {
    socket.on('LISTEN_NOTIFICATIONS', ({ userId }) => {
      if (userId) socket.join(`user_${userId}`)
    })

    socket.on('AUTH', async ({ userId, chatroomId }) => {
      try {
        socket.userId = parseInt(userId, 10)
        socket.chatroomId = parseInt(chatroomId, 10)

        const roomStatus = await chatService.verifyMembership(
          socket.userId,
          socket.chatroomId
        )

        if (!roomStatus.isMember) {
          socket.emit('ERROR', { message: chatSocketStrings.membershipError })
          return socket.disconnect()
        }

        socket.join(`room_${socket.chatroomId}`)
        socket.emit('AUTH_OK', { is_closed: roomStatus.is_closed })
      } catch (err) {
        console.error(chatSocketStrings.authError, err)
        socket.disconnect()
      }
    })

    socket.on('SEND_MESSAGE', async ({ content }) => {
      const userId = socket.userId
      const chatroomId = socket.chatroomId

      if (!userId || !chatroomId) {
        console.error(chatSocketStrings.messageBlocked)
        return
      }

      try {
        const savedMessage = await chatService.saveMessage(
          chatroomId,
          userId,
          content
        )

        if (savedMessage) {
          io.to(`room_${chatroomId}`).emit('NEW_MESSAGE', {
            message: savedMessage.data,
          })
          const membersResult = await chatService.getRoomMembers(chatroomId)
          if (membersResult.success) {
            membersResult.data.forEach(member => {
              if (member.id !== userId) {
                io.to(`user_${member.id}`).emit('NEW_MESSAGE_NOTIFICATION', {
                  chatroomId,
                })
              }
            })
          }
        }
      } catch (err) {
        console.error(chatSocketStrings.socketMessageError, err)
      }
    })

    return io
  })
}

/**
 * Utility function to broadcast an event to a specific chatroom.
 *
 * @param {number} chatroomId The ID of the chatroom to broadcast to
 * @param {string} type The type of message to broadcast
 * @param {any} payload The message payload
 */
const broadcast = (chatroomId, type, payload) => {
  if (io) io.to(`room_${chatroomId}`).emit(type, payload)
}

module.exports = { initSocket, broadcast }
