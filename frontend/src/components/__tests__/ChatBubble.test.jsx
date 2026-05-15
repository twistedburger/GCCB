import { render, screen } from '@testing-library/react'
import ChatBubble from '../chats/ChatBubble'
import { chatBubbleStrings } from '../../locales/en/ComponentStrings/ChatBubbleStrings'

jest.mock('../../locales/en/ComponentStrings/ChatBubbleStrings', () => ({
  chatBubbleStrings: {
    you: 'You',
  },
}))

describe('ChatBubble', () => {
  const mockMessage = {
    senderNickname: 'JohnDoe',
    content: 'Hellooo!',
    sentAt: '2026-05-14T10:30:00Z',
    isSystem: false,
  }

  it('renders the message content correctly', () => {
    render(<ChatBubble message={mockMessage} isMe={false} />)

    expect(screen.getByText(mockMessage.content)).toBeInTheDocument()
    expect(screen.getByText(mockMessage.senderNickname)).toBeInTheDocument()
  })

  it('displays "You" as the sender when isMe is true', () => {
    render(<ChatBubble message={mockMessage} isMe={true} />)

    expect(screen.getByText(chatBubbleStrings.you)).toBeInTheDocument()
    expect(
      screen.queryByText(mockMessage.senderNickname)
    ).not.toBeInTheDocument()
  })

  it('applies correct styling for "isMe" (right-aligned)', () => {
    const { container } = render(
      <ChatBubble message={mockMessage} isMe={true} />
    )
    const wrapper = container.firstChild

    expect(wrapper).toHaveClass('self-end')
    expect(wrapper).toHaveClass('items-end')
  })

  it('applies correct styling for incoming messages (left-aligned)', () => {
    const { container } = render(
      <ChatBubble message={mockMessage} isMe={false} />
    )
    const wrapper = container.firstChild

    expect(wrapper).toHaveClass('self-start')
    expect(wrapper).toHaveClass('items-start')
  })

  it('renders correctly as a system message', () => {
    const systemMessage = {
      ...mockMessage,
      isSystem: true,
      content: 'USER JOINED THE CHAT',
    }

    render(<ChatBubble message={systemMessage} isMe={false} />)

    const systemElement = screen.getByText(systemMessage.content)
    expect(systemElement).toBeInTheDocument()

    expect(
      screen.queryByText(mockMessage.senderNickname)
    ).not.toBeInTheDocument()

    const wrapper = systemElement.closest('div')
    expect(wrapper).toHaveClass('justify-center')
  })

  it('formats the timestamp correctly', () => {
    render(<ChatBubble message={mockMessage} isMe={false} />)
    screen.debug()
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })
})
