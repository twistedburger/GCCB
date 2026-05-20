import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useUser } from './UserContext'
import PropTypes from 'prop-types'
const baseUrl = import.meta.env.VITE_API_BASE_URL
const UnreadMessagesContext = createContext(null)

/**
 * A context provider for managing unread messages.
 *
 * @param {React.ReactNode} children - The child components that will have access to the unread messages context.
 * @returns
 */
export function UnreadMessagesProvider({ children }) {
  const { user } = useUser()
  const [unreadRoomIds, setUnreadRoomIds] = useState(new Set())
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return

    const socket = io(baseUrl, { withCredentials: true })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('LISTEN_NOTIFICATIONS', { userId: user.id })
    })

    socket.on('NEW_MESSAGE_NOTIFICATION', ({ chatroomId }) => {
      setUnreadRoomIds(prev => new Set([...prev, chatroomId]))
    })

    return () => socket.disconnect()
  }, [user?.id])

  const clearRoomUnread = chatroomId => {
    setUnreadRoomIds(prev => {
      const next = new Set(prev)
      next.delete(chatroomId)
      return next
    })
  }

  const hasUnread = unreadRoomIds.size > 0

  return (
    <UnreadMessagesContext.Provider
      value={{ unreadRoomIds, clearRoomUnread, hasUnread }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  )
}

UnreadMessagesProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext)
}
