const { Server } = require('socket.io')
const chatService = require('../src/service/chat.service')
const { chatSocketStrings } = require('../locales/en/socket/chatSocketLocales')

let io

const initSocket = httpServer => {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  })

  io.on('connection', socket => {
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
            message: savedMessage,
          })
        }
      } catch (err) {
        console.error(chatSocketStrings.socketMessageError, err)
      }
    })

    return io
  })
}

const broadcast = (chatroomId, type, payload) => {
  if (io) io.to(`room_${chatroomId}`).emit(type, payload)
}

module.exports = { initSocket, broadcast }
