import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const baseUrl = import.meta.env.VITE_API_BASE_URL

export function useUnreadMessages(userId) {
  const [hasUnread, setHasUnread] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!userId) return

    const socket = io(baseUrl, { withCredentials: true })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('LISTEN_NOTIFICATIONS', { userId })
    })

    socket.on('NEW_MESSAGE_NOTIFICATION', () => {
      setHasUnread(true)
    })

    return () => socket.disconnect()
  }, [userId])

  const clearUnread = () => setHasUnread(false)

  return { hasUnread, clearUnread }
}
