import { render, screen } from '@testing-library/react'
import ChatBox from '../chats/ChatBox'
import { chatBoxStrings } from '../../locales/en/ComponentStrings/ChatBoxStrings'

jest.mock('../chats/ChatBubble', () => {
  const PropTypes = require('prop-types')

  const MockChatBubble = ({ message, isMe }) => {
    return (
      <div data-testid="chat-bubble" data-isme={isMe}>
        {message.content}
      </div>
    )
  }

  MockChatBubble.propTypes = {
    message: PropTypes.shape({
      content: PropTypes.string,
    }),
    isMe: PropTypes.bool,
  }

  return MockChatBubble
})

jest.mock('../chats/ChatInput', () => {
  return function MockChatInput() {
    return <div data-testid="chat-input" />
  }
})

jest.mock('../../locales/en/ComponentStrings/ChatBoxStrings', () => ({
  chatBoxStrings: {
    oneParticipant: '1 participant',
    participants: 'participants',
  },
}))

describe('ChatBox', () => {
  const defaultProps = {
    activeRoom: { routeTitle: 'Stroll to Library' },
    messages: [
      {
        id: '1',
        senderId: 'user-123',
        content: 'My message',
        sentAt: '2026-05-14T10:00:00Z',
      },
      {
        id: '2',
        senderId: 'user-456',
        content: 'Other message',
        sentAt: '2026-05-14T10:05:00Z',
      },
    ],
    user: { id: 'user-123' },
    members: [{ id: 'user-123' }, { id: 'user-456' }],
    isClosed: false,
    isConnected: true,
    isDeleted: false,
    input: '',
    setInput: jest.fn(),
    onSendMessage: jest.fn(),
  }

  it('renders the room title and correct participant count', () => {
    render(<ChatBox {...defaultProps} />)

    expect(screen.getByText('Stroll to Library')).toBeInTheDocument()
    const expectedText = `2 ${chatBoxStrings.participants}`
    expect(screen.getByText(expectedText)).toBeInTheDocument()
  })

  it('displays "1 participant" correctly for single-member rooms', () => {
    render(<ChatBox {...defaultProps} members={[{ id: '1' }]} />)
    const expectedText = chatBoxStrings.oneParticipant
    expect(screen.getByText(expectedText)).toBeInTheDocument()
  })

  it('correctly identifies which messages are "Me"', () => {
    render(<ChatBox {...defaultProps} />)
    const bubbles = screen.getAllByTestId('chat-bubble')
    // First message is from me
    expect(bubbles[0]).toHaveAttribute('data-isme', 'true')
    // Second message is from someone else
    expect(bubbles[1]).toHaveAttribute('data-isme', 'false')
  })

  it('handles null/undefined user gracefully', () => {
    render(<ChatBox {...defaultProps} user={null} />)
    const bubbles = screen.getAllByTestId('chat-bubble')

    expect(bubbles[0]).toHaveAttribute('data-isme', 'false')
  })

  it('scrolls to the bottom when new messages are added', () => {
    const { rerender } = render(<ChatBox {...defaultProps} />)

    const scrollContainer =
      screen.getAllByTestId('chat-bubble')[0].parentElement

    Object.defineProperty(scrollContainer, 'scrollHeight', {
      configurable: true,
      value: 500,
    })
    const scrollTopSpy = jest.spyOn(scrollContainer, 'scrollTop', 'set')

    const newMessages = [
      ...defaultProps.messages,
      { id: '3', senderId: '1', content: 'New!' },
    ]
    rerender(<ChatBox {...defaultProps} messages={newMessages} />)

    expect(scrollTopSpy).toHaveBeenCalledWith(500)
  })

  it('passes status props to ChatInput', () => {
    render(<ChatBox {...defaultProps} isClosed={true} isConnected={false} />)
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
  })
})
