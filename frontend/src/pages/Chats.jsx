import { useUser } from '../../context/UserContext'
import { useChatRoom } from '../hooks/UseChatRoom'
import GenericCard from '../components/GenericCard'
import ChatBox from '../components/chats/ChatBox'
import { chatsStrings } from '../locales/en/ChatsStrings'

export default function Chats() {
  const { user } = useUser()
  const chat = useChatRoom(user)
  const rooms = chat.rooms
  console.log('Rooms:', rooms) // Debugging log to check the structure of rooms

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

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
          {chat.rooms.map(room => (
            <GenericCard
              key={room.id}
              onClick={() => chat.openRoom(room)}
              customStyling={`p-3 md:p-4 shadow-sm border border-light-grey/50 ${chat.activeRoom?.id === room.id ? 'ring-2 ring-blue-primary bg-blue-secondary' : 'bg-white hover:bg-blue-secondary/10'}`}
            >
              <div className="flex justify-between items-start min-w-0">
                <span className="font-semibold text-sm truncate mr-2">
                  {room.routeTitle}
                </span>
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${room.is_closed ? 'bg-medium-grey' : 'bg-green-primary'}`}
                />
              </div>
              <p className="text-[10px] text-text-secondary mt-1 uppercase tracking-widest font-bold">
                {room.is_closed ? chatsStrings.archived : chatsStrings.active}
              </p>
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
