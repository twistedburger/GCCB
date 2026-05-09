import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useUser } from '../../context/UserContext'
import GenericCard from '../components/GenericCard'
import ChatBox from '../components/chats/ChatBox'
import { chatsStrings } from '../locales/en/ChatsStrings'

const baseUrl = import.meta.env.VITE_API_BASE_URL

export default function Chats() {
  const { user } = useUser()

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

  const startResizing = useCallback(() => {
    if (sidebarRef.current) {
      const actualWidth = sidebarRef.current.getBoundingClientRect().width
      setSidebarWidth(actualWidth)
    }
    setIsResizing(true)
  }, [])

  //resizing sidebar
  useEffect(() => {
    if (!isResizing) return

    const handleResize = e => {
      const clientX = e.type.startsWith('touch')
        ? e.touches[0].clientX
        : e.clientX

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

  useEffect(() => {
    fetch(`${baseUrl}/api/chat/rooms`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(err => console.error(chatsStrings.error.roomFetch, err))
  }, [])

  const openRoom = async room => {
    setActiveRoom(room)

    try {
      //get room detail
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

  //socket events
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
        if (prev.find(m => String(m.id) === String(data.newMember.id)))
          return prev
        return [...prev, data.newMember]
      })

      const userNickname =
        data.newMember.nickname || chatsStrings.fallbackNewMember
      const systemMsg = {
        id: `sys-join-${Date.now()}`,
        content: `${userNickname} ${chatsStrings.systemMemberJoined}`,
        sent_at: new Date().toISOString(),
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
        sent_at: new Date().toISOString(),
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
  }, [activeRoom?.id, user?.id])

  return (
    <div
      className={`flex h-screen bg-background-off-white text-text-primary overflow-hidden ${
        isResizing ? 'cursor-col-resize select-none touch-none' : ''
      }`}
    >
      {/* sidebar */}
      <aside
        ref={sidebarRef}
        style={{
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
          maxWidth: `${sidebarWidth}px`,
        }}
        className="flex flex-col border-r border-light-grey bg-drawer-background shrink-0 overflow-hidden"
      >
        <div className="p-4 md:p-6 border-b border-light-grey bg-white text-lg md:text-xl font-bold tracking-tight shrink-0">
          {chatsStrings.sidebarTitle}
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
          {rooms.map(room => (
            <GenericCard
              key={room.id}
              onClick={() => openRoom(room)}
              customStyling={`p-3 md:p-4 shadow-sm border border-light-grey/50 ${
                activeRoom?.id === room.id
                  ? 'ring-2 ring-blue-primary bg-blue-secondary'
                  : 'bg-white hover:bg-blue-secondary/10'
              }`}
            >
              <div className="flex justify-between items-start min-w-0">
                <span className="font-semibold text-sm truncate mr-2">
                  {room.route_title}
                </span>
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    room.is_closed ? 'bg-medium-grey' : 'bg-green-primary'
                  }`}
                />
              </div>
              <p className="text-[10px] text-text-secondary mt-1 uppercase tracking-widest font-bold">
                {room.is_closed ? chatsStrings.archived : chatsStrings.active}
              </p>
            </GenericCard>
          ))}
        </div>
      </aside>

      {/* divider */}
      <div
        onMouseDown={startResizing}
        onTouchStart={startResizing}
        className={`group relative w-1 h-full cursor-col-resize transition-colors z-30 ${
          isResizing ? 'bg-blue-primary' : 'hover:bg-blue-primary/40'
        }`}
      >
        <div className="absolute inset-y-0 -left-2 -right-2" />
      </div>

      {/* chat area */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0 bg-white">
        {activeRoom ? (
          <ChatBox
            activeRoom={activeRoom}
            messages={messages}
            user={user}
            members={members}
            isClosed={isClosed}
            isConnected={isConnected}
            isDeleted={isDeleted}
            input={input}
            setInput={setInput}
            onSendMessage={() => {
              if (!input.trim() || !socketRef.current) return
              const messageData = {
                chatroomId: activeRoom.id,
                content: input,
                senderId: user.id,
              }
              socketRef.current.emit('SEND_MESSAGE', messageData)
              setInput('')
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background-off-white font-medium italic text-medium-grey">
            {chatsStrings.selectConversation}
          </div>
        )}
      </main>
    </div>
  )
}
