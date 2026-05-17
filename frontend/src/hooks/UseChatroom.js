import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { chatsStrings } from '../locales/en/ChatsStrings'

const baseUrl = import.meta.env.VITE_API_BASE_URL

/**
 * Custom hook to manage chatroom state and interactions,
 * including fetching rooms, handling active room details, managing WebSocket connections for real-time updates,
 * and implementing sidebar resizing logic.
 *
 * @param {user} User object representing the authenticated user.
 * @returns
 */
export function useChatRoom(user) {
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState([])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)

  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [isResizing, setIsResizing] = useState(false)

  const sidebarRef = useRef(null)
  const socketRef = useRef(null)

  // Sidebar Resizing Logic
  const startResizing = useCallback(() => {
    if (sidebarRef.current) {
      const actualWidth = sidebarRef.current.getBoundingClientRect().width
      setSidebarWidth(actualWidth)
    }
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleResize = event => {
      const clientX = event.type.startsWith('touch')
        ? event.touches[0].clientX
        : event.clientX
      const offsetLeft = sidebarRef.current
        ? sidebarRef.current.getBoundingClientRect().left
        : 0
      const newWidth = clientX - offsetLeft

      if (newWidth >= 150 && newWidth <= window.innerWidth * 0.8) {
        setSidebarWidth(newWidth)
      }
    }

    const stopResizing = () => setIsResizing(false)

    window.addEventListener('mousemove', handleResize)
    window.addEventListener('mouseup', stopResizing)
    window.addEventListener('touchmove', handleResize, { passive: false })
    window.addEventListener('touchend', stopResizing)

    return () => {
      window.removeEventListener('mousemove', handleResize)
      window.removeEventListener('mouseup', stopResizing)
      window.removeEventListener('touchmove', handleResize)
      window.removeEventListener('touchend', stopResizing)
    }
  }, [isResizing])

  // Initial Rooms Fetch
  useEffect(() => {
    fetch(`${baseUrl}/api/chat/rooms`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(err => console.error(chatsStrings.error.roomFetch, err))
  }, [])

  const openRoom = async room => {
    setActiveRoom(room)
    try {
      const res = await fetch(`${baseUrl}/api/chat/rooms/${room.id}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(data.messages)
        setMembers(data.members)
        setIsClosed(data.chatroom.is_closed)
      }
    } catch (err) {
      console.error(chatsStrings.error.roomDetail, err)
    }
  }

  // Socket Events
  useEffect(() => {
    if (!activeRoom || !user?.id) return

    const socket = io(baseUrl, { withCredentials: true })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('AUTH', { userId: user.id, chatroomId: activeRoom.id })
    })

    socket.on('AUTH_OK', data => {
      setIsConnected(true)
      setIsClosed(data.is_closed)
    })

    socket.on('NEW_MESSAGE', data => {
      setMessages(prev => [...prev, data.message])
    })

    socket.on('ROOM_CLOSED', () => setIsClosed(true))

    socket.on('MEMBER_JOINED', data => {
      setMembers(prev => {
        // Ensure we handle member as an object to match initial fetch
        if (prev.find(m => String(m.id) === String(data.userId))) return prev
        return [
          ...prev,
          {
            id: data.userId,
            nickname: data.userNickname || chatsStrings.fallbackNewMember,
          },
        ]
      })

      const userNickname = data.userNickname || chatsStrings.fallbackNewMember
      const systemMsg = {
        id: `sys-join-${Date.now()}`,
        content: `${userNickname} ${chatsStrings.systemMemberJoined}`,
        sentAt: new Date().toISOString(),
        isSystem: true,
      }
      setMessages(prev => [...prev, systemMsg])
    })

    socket.on('MEMBER_LEFT', data => {
      setMembers(prev => prev.filter(m => String(m.id) !== String(data.userId)))
      const userNickname = data.userNickname || chatsStrings.fallbackNickname
      const systemMsg = {
        id: `sys-${Date.now()}`,
        content: `${userNickname} ${chatsStrings.systemMemberLeft}`,
        sentAt: new Date().toISOString(),
        isSystem: true,
      }
      setMessages(prev => [...prev, systemMsg])
    })

    socket.on('ROOM_DELETED', data => {
      if (String(data.chatroomId) === String(activeRoom?.id)) {
        setIsDeleted(true)
      }
    })

    socket.on('ERROR', data => {
      console.error('Server error:', data.message)
    })

    socket.on('disconnect', () => setIsConnected(false))

    return () => {
      socket.disconnect()
    }
  }, [activeRoom, user?.id])

  const handleSendMessage = () => {
    if (!input.trim() || !socketRef.current) return
    const messageData = {
      chatroomId: activeRoom.id,
      content: input,
      senderId: user.id,
    }
    socketRef.current.emit('SEND_MESSAGE', messageData)
    setInput('')
  }

  return {
    rooms,
    activeRoom,
    messages,
    members,
    input,
    setInput,
    isConnected,
    isClosed,
    isDeleted,
    sidebarWidth,
    isResizing,
    sidebarRef,
    openRoom,
    startResizing,
    handleSendMessage,
  }
}
