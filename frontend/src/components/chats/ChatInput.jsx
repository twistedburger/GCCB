import TextBox from '../TextBox'
import GenericButton from '../GenericButton'
import PropTypes from 'prop-types'
import { chatInputStrings } from '../../locales/en/ComponentStrings/ChatInputStrings'

export default function ChatInput({
  input,
  setInput,
  onSendMessage,
  isClosed,
  isConnected,
  isDeleted,
}) {
  const handleKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSendMessage()
    }
  }

  const getPlaceholder = () => {
    if (isDeleted) return chatInputStrings.deleted
    if (isClosed) return chatInputStrings.closed
    if (!isConnected) return chatInputStrings.connecting
    return chatInputStrings.placeholder
  }

  const isSendDisabled = !input.trim() || isClosed || !isConnected || isDeleted

  return (
    <div
      className={`p-4 bg-white border-t border-light-grey transition-opacity duration-500 ${isDeleted ? 'opacity-60' : 'opacity-100'}`}
    >
      <div className="flex items-end gap-2 max-w-6xl mx-auto">
        <div className="flex-1">
          <TextBox
            placeholder={getPlaceholder()}
            value={isDeleted ? '' : input} // Clear input if deleted
            onChange={event => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isClosed || !isConnected || isDeleted}
            multiline={false}
          />
        </div>

        <GenericButton
          onClick={onSendMessage}
          disabled={isSendDisabled}
          customStyling="m-0 mb-4 px-6 py-3 h-[50px] flex items-center justify-center shrink-0"
        >
          {chatInputStrings.sendButton}
        </GenericButton>
      </div>
    </div>
  )
}

ChatInput.propTypes = {
  input: PropTypes.string.isRequired,
  setInput: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  isClosed: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool.isRequired,
  isDeleted: PropTypes.bool.isRequired,
}
