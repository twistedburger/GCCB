const { pool } = require('../../db.js')
const {
  chatServiceStrings,
} = require('../../locales/en/services/ChatServicesLocales.js')

/**
 * Fetches all members of a chatroom.
 */
const getRoomMembers = async chatroomId => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nickname FROM "user" u
       JOIN chatroom_member cm ON u.id = cm.user_id
       WHERE cm.chatroom_id = $1`,
      [chatroomId]
    )
    return { success: true, data: result.rows }
  } catch (err) {
    console.error(chatServiceStrings.errors.fetchRooms, err)
    return { success: false, error: chatServiceStrings.errors.fetchRooms }
  }
}

/**
 * Closes expired rooms and deletes archived ones.
 */
const performRoomCleanup = async () => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    //close if past close_at and not already closed
    await client.query(`
      UPDATE "chatroom" SET is_closed = TRUE 
      WHERE is_closed = FALSE AND close_at <= CURRENT_TIMESTAMP
    `)

    //delete if past delete_at
    await client.query(`
      DELETE FROM "chatroom" WHERE delete_at <= CURRENT_TIMESTAMP
    `)
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(chatServiceStrings.errors.cleanup, err)
    throw err
  } finally {
    client.release()
  }
}

/**
 * Fetches all chat rooms the user is a member of.
 */
const getRoomsByUserId = async userId => {
  try {
    const result = await pool.query(
      `
      SELECT 
        c.*, 
        r.title AS "routeTitle" 
      FROM chatroom c
      JOIN route r ON c.route_id = r.id
      WHERE c.id IN (SELECT chatroom_id FROM chatroom_member WHERE user_id = $1)
      ORDER BY c.created_at DESC
    `,
      [userId]
    )
    return { success: true, data: result.rows }
  } catch (err) {
    console.error(chatServiceStrings.errors.fetchRooms, err)
    return { success: false, error: chatServiceStrings.errors.fetchRooms }
  }
}

/**
 * Fetches full details for a chat room.
 */
const getRoomFullDetails = async chatroomId => {
  try {
    const room = await pool.query(
      `
      SELECT 
        c.*, 
        r.title AS "routeTitle"
      FROM chatroom c
      JOIN route r ON c.route_id = r.id
      WHERE c.id = $1
    `,
      [chatroomId]
    )

    const messages = await pool.query(
      `
    SELECT 
      m.id,
      m.chatroom_id,
      m.sender_id AS "senderId",
      m.content,
      m.sent_at AS "sentAt",
      u.nickname AS "senderNickname" 
    FROM chat_message m
    JOIN "user" u ON m.sender_id = u.id
    WHERE m.chatroom_id = $1 
    ORDER BY m.sent_at ASC
    `,
      [chatroomId]
    )

    const members = await pool.query(
      `
      SELECT u.id, u.nickname FROM "user" u
      JOIN chatroom_member cm ON u.id = cm.user_id
      WHERE cm.chatroom_id = $1
    `,
      [chatroomId]
    )

    return {
      success: true,
      data: {
        chatroom: room.rows[0],
        messages: messages.rows,
        members: members.rows,
      },
    }
  } catch (err) {
    console.error(chatServiceStrings.errors.roomDetails, err)
    return { success: false, error: chatServiceStrings.errors.roomDetails }
  }
}

/**
 * Checks if the user is a member of the room.
 */
const verifyMembership = async (userId, chatroomId) => {
  try {
    const result = await pool.query(
      `
      SELECT cm.*, c.is_closed 
      FROM chatroom_member cm
      JOIN chatroom c ON cm.chatroom_id = c.id
      WHERE cm.user_id = $1 AND cm.chatroom_id = $2
    `,
      [userId, chatroomId]
    )

    if (result.rowCount === 0) return { success: true, isMember: false }

    return {
      success: true,
      isMember: true,
      is_closed: result.rows[0].is_closed,
    }
  } catch (err) {
    console.error(chatServiceStrings.errors.membership, err)
    return { success: false, error: chatServiceStrings.errors.membership }
  }
}

/**
 * Adds a user to a chat room.
 */
const addUserToRoom = async (chatroomId, userId, db = pool) => {
  try {
    await db.query(
      `
      INSERT INTO chatroom_member (chatroom_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (chatroom_id, user_id) DO NOTHING
    `,
      [chatroomId, userId]
    )

    const user = await db.query(
      'SELECT id, nickname FROM "user" WHERE id = $1',
      [userId]
    )
    return { success: true, data: user.rows[0] }
  } catch (err) {
    console.error(chatServiceStrings.errors.addUser, err)
    return { success: false, error: chatServiceStrings.errors.addUser }
  }
}

/**
 * Removes a user from a chat room.
 */
const removeUserFromRoom = async (chatroomId, userId) => {
  try {
    await pool.query(
      `
      DELETE FROM chatroom_member 
      WHERE chatroom_id = $1 AND user_id = $2
    `,
      [chatroomId, userId]
    )
    return { success: true }
  } catch (err) {
    console.error(chatServiceStrings.errors.removeUser, err)
    return { success: false, error: chatServiceStrings.errors.removeUser }
  }
}

/**
 * Creates a new chat room for a route.
 */
const createNewRoom = async (client, routeId, userId, closeAt) => {
  try {
    const result = await client.query(
      `
      INSERT INTO chatroom (route_id, close_at, delete_at)
      VALUES ($1, $2::timestamp, $2::timestamp + interval '${chatServiceStrings.intervals.deletionBuffer}')
      RETURNING id
    `,
      [routeId, closeAt]
    )

    const chatroomId = result.rows[0].id
    const addedUser = await addUserToRoom(chatroomId, userId, client)

    if (!addedUser.success) throw new Error(addedUser.error)

    return { success: true, chatroomId }
  } catch (err) {
    console.error(chatServiceStrings.errors.createRoom, err)
    return { success: false, error: chatServiceStrings.errors.createRoom }
  }
}

/**
 * Deletes a chat room and all associated data.
 */
const deleteRoom = async (client, routeId) => {
  try {
    const res = await client.query(
      'SELECT id FROM chatroom WHERE route_id = $1',
      [routeId]
    )
    const chatroomId = res.rows[0]?.id

    if (chatroomId) {
      await client.query('DELETE FROM chat_message WHERE chatroom_id = $1', [
        chatroomId,
      ])
      await client.query('DELETE FROM chatroom_member WHERE chatroom_id = $1', [
        chatroomId,
      ])
      await client.query('DELETE FROM chatroom WHERE id = $1', [chatroomId])
    }

    return { success: true, chatroomId }
  } catch (err) {
    console.error(chatServiceStrings.errors.deleteRoom, err)
    return { success: false, error: chatServiceStrings.errors.deleteRoom }
  }
}

/**
 * Saves a message to a chat room.
 */
const saveMessage = async (chatroomId, senderId, content) => {
  try {
    const insertResult = await pool.query(
      `INSERT INTO chat_message (chatroom_id, sender_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [chatroomId, senderId, content]
    )

    const newMessage = insertResult.rows[0]

    const userResult = await pool.query(
      'SELECT nickname FROM "user" WHERE id = $1',
      [senderId]
    )

    return {
      success: true,
      data: {
        id: newMessage.id,
        chatroomId: newMessage.chatroom_id,
        senderId: newMessage.sender_id,
        content: newMessage.content,
        sentAt: newMessage.sent_at,
        senderNickname: userResult.rows[0].nickname,
      },
    }
  } catch (err) {
    console.error(chatServiceStrings.errors.saveMessage, err)
    return { success: false, error: chatServiceStrings.errors.saveMessage }
  }
}

module.exports = {
  performRoomCleanup,
  getRoomsByUserId,
  getRoomFullDetails,
  verifyMembership,
  addUserToRoom,
  removeUserFromRoom,
  createNewRoom,
  deleteRoom,
  saveMessage,
  getRoomMembers,
}
