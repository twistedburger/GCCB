import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useChatRoom } from '../hooks/UseChatRoom'
import GenericCard from '../components/GenericCard'
import ChatBox from '../components/chats/ChatBox'
import { chatsStrings } from '../locales/en/ChatsStrings'
import { useUnreadMessages } from '../../context/UnreadMessagesContext'

/**
 * Provides a split-screen page displaying list of participating chatrooms on the left and active chatbox on the right.
 * Users can select a chatroom to view and send messages. The sidebar is resizable for better user experience.
 *
 * @returns {JSX.Element} The Chats page component.
 */
export default function Chats() {
  const { user } = useUser()
  const chat = useChatRoom(user)
  const { unreadRoomIds, clearRoomUnread } = useUnreadMessages()
  const location = useLocation()

  useEffect(() => {
    const openRoomId = location.state?.openRoomId
    if (!openRoomId || !chat.rooms.length) return

    const room = chat.rooms.find(r => r.id === openRoomId)
    if (!room) return

    chat.openRoom(room)
    clearRoomUnread(room.id)
    window.history.replaceState({}, '')
  }, [chat.rooms, location.state?.openRoomId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`flex h-screen bg-background-off-white text-text-primary overflow-hidden ${chat.isResizing ? 'cursor-col-resize select-none touch-none' : ''}`}
    >
      <aside
        ref={chat.sidebarRef}
        style={{
          width: `${chat.sidebarWidth}px`,
          minWidth: `${chat.sidebarWidth}px`,
          maxWidth: `${chat.sidebarWidth}px`,
        }}
        className="flex flex-col border-r border-light-grey bg-drawer-background shrink-0 overflow-hidden"
      >
        <div className="p-4 md:p-6 border-b border-light-grey bg-white text-lg md:text-xl font-bold tracking-tight shrink-0">
          {chatsStrings.sidebarTitle}
        </div>

        {/* chat rooms list */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
          {chat.rooms.map(room => (
            <GenericCard
              key={room.id}
              onClick={() => {
                chat.openRoom(room)
                clearRoomUnread(room.id)
              }}
              customStyling={`p-3 md:p-4 shadow-sm border border-light-grey/50 ${
                chat.activeRoom?.id === room.id
                  ? 'ring-2 ring-blue-primary bg-blue-secondary'
                  : 'bg-white hover:bg-blue-secondary/10'
              }`}
            >
              <div className="flex justify-between items-center mb-2 min-w-0">
                <span className="font-bold text-sm truncate mr-2 text-text-primary">
                  {room.routeTitle}
                </span>

                {unreadRoomIds.has(room.id) && (
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shrink-0" />
                )}
              </div>

              {/* status pill(active/archived) */}
              <div className="flex items-center">
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    room.is_closed
                      ? 'bg-drawer-background text-medium-grey'
                      : 'bg-green-primary/10 text-green-primary'
                  }`}
                >
                  {room.is_closed ? chatsStrings.archived : chatsStrings.active}
                </span>
              </div>
            </GenericCard>
          ))}
        </div>
      </aside>

      <div
        onMouseDown={chat.startResizing}
        onTouchStart={chat.startResizing}
        className={`group relative w-1 h-full cursor-col-resize transition-colors z-30 ${chat.isResizing ? 'bg-blue-primary' : 'hover:bg-blue-primary/40'}`}
      >
        <div className="absolute inset-y-0 -left-2 -right-2" />
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0 bg-white">
        {chat.activeRoom ? (
          <ChatBox
            activeRoom={chat.activeRoom}
            messages={chat.messages}
            user={user}
            members={chat.members}
            isClosed={chat.isClosed}
            isConnected={chat.isConnected}
            isDeleted={chat.isDeleted}
            input={chat.input}
            setInput={chat.setInput}
            onSendMessage={chat.handleSendMessage}
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
