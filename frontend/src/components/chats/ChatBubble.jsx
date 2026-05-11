import PropTypes from 'prop-types'
import { chatBubbleStrings } from '../../locales/en/ComponentStrings/ChatBubbleStrings'

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

  return (
    <div
      className={`flex flex-col max-w-[75%] w-full ${
        isMe ? 'self-end items-end' : 'self-start items-start'
      }`}
    >
      <div className="flex items-baseline gap-2 mb-1 px-1">
        <span className="text-xs font-bold text-dark-grey">
          {isMe ? chatBubbleStrings.you : message.sender_nickname}
        </span>
        <span className="text-[9px] text-dark-grey uppercase">
          {new Date(message.sent_at).toLocaleTimeString([], {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <div
        className={`px-4 py-2 text-sm shadow-sm [word-break:break-word] overflow-hidden ${
          isMe
            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none'
            : 'bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-none'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>{' '}
      </div>
    </div>
  )
}

ChatBubble.propTypes = {
  message: PropTypes.shape({
    sender_nickname: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    sent_at: PropTypes.string.isRequired,
    isSystem: PropTypes.bool,
  }).isRequired,
  isMe: PropTypes.bool.isRequired,
}
