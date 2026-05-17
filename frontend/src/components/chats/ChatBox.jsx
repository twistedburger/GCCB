import { useEffect, useRef } from 'react'
import ChatBubble from './ChatBubble'
import ChatInput from './ChatInput'
import { chatBoxStrings } from '../../locales/en/ComponentStrings/ChatBoxStrings'
import PropTypes from 'prop-types'

/**
 * Component for rendering the main chat interface.
 *
 * @param {activeRoom} activeRoom object containing details of the currently active chat room, including routeTitle.
 * @param {messages} Array of message objects to display in the chat, each containing sender data, content, sentAt, and isSystem properties.
 * @param {user} User object representing the message creator.
 * @param {members} Array of user objects representing the members of the chat room.
 * @param {isClosed} Boolean indicating if the chat room is closed.
 * @param {isConnected} Boolean indicating if the user is connected to the chat.
 * @param {isDeleted} Boolean indicating if the chat room is deleted.
 * @param {input} String representing the current value of the chat input field.
 * @param {setInput} Function to update the input state when the user types a message.
 * @param {onSendMessage} Function to call when the user sends a message, typically handling the message submission logic.
 * @returns JSX element representing the chat box.
 */
export default function ChatBox({
  activeRoom,
  messages,
  user,
  members,
  isClosed,
  isConnected,
  isDeleted,
  input,
  setInput,
  onSendMessage,
}) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-50">
      {/* header */}
      <header className="h-15 px-6 flex items-center justify-between bg-white border-b border-zinc-200">
        <div>
          <h3 className="font-bold text-zinc-900 leading-tight">
            {activeRoom.routeTitle}
          </h3>
          <p className="text-xs text-zinc-500">
            {members.length === 1
              ? chatBoxStrings.oneParticipant
              : `${members.length} ${chatBoxStrings.participants}`}
          </p>
        </div>
      </header>

      {/* messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 w-full"
      >
        {messages.map(message => (
          <ChatBubble
            key={message.id}
            message={message}
            isMe={String(user?.id) === String(message.senderId)}
          />
        ))}
      </div>

      {/* input text */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSendMessage={onSendMessage}
        isClosed={isClosed}
        isConnected={isConnected}
        isDeleted={isDeleted}
      />
    </div>
  )
}

ChatBox.propTypes = {
  activeRoom: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  isClosed: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool.isRequired,
  isDeleted: PropTypes.bool.isRequired,
  input: PropTypes.string.isRequired,
  setInput: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
}
