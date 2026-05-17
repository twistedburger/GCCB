import PropTypes from 'prop-types'
import { chatBubbleStrings } from '../../locales/en/ComponentStrings/ChatBubbleStrings'
import { Person } from '@mui/icons-material'

/**
 * Component for rendering a single chat message bubble.
 *
 * @param {message} message chat message object containing senderNickname, content, sentAt, profilePic and isSystem properties.
 * @param {isMe} Boolean indicating if the message was sent by the current user.
 * @returns JSX element representing the chat bubble.
 */
export default function ChatBubble({ message, isMe }) {
  if (message.isSystem) {
    return (
      <div className="flex justify-center w-full my-3">
        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-4 py-1 rounded-full uppercase tracking-widest shadow-sm border border-zinc-200">
          {message.content}
        </span>
      </div>
    )
  }

  const ProfileImage = () => (
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-zinc-200 border border-zinc-300 flex items-center justify-center">
      {message.profilePic ? (
        <img src={message.profilePic} className="w-full h-full object-cover" />
      ) : (
        <Person className="text-text-secondary" style={{ fontSize: 25 }} />
      )}
    </div>
  )

  return (
    <div
      className={`flex flex-col max-w-[75%] w-full ${
        isMe ? 'self-end items-end' : 'self-start items-start'
      }`}
    >
      {/* sender info */}
      <div
        className={`flex items-center gap-2 mb-1 px-1 ${
          isMe ? 'flex-row-reverse text-right' : 'flex-row text-left'
        }`}
      >
        <ProfileImage />

        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          <span className="text-xs font-bold text-dark-grey">
            {isMe ? chatBubbleStrings.you : message.senderNickname}
          </span>
          <span className="text-[9px] text-dark-grey uppercase">
            {new Date(message.sentAt).toLocaleTimeString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* message bubble */}
      <div
        className={`px-4 py-2 text-sm shadow-sm [word-break:break-word] overflow-hidden ${
          isMe
            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none'
            : 'bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-none'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}

ChatBubble.propTypes = {
  message: PropTypes.shape({
    senderNickname: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    sentAt: PropTypes.string.isRequired,
    isSystem: PropTypes.bool,
    profilePic: PropTypes.string,
  }).isRequired,
  isMe: PropTypes.bool.isRequired,
}
