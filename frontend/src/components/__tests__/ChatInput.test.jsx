import { render, screen, fireEvent } from '@testing-library/react'
import ChatInput from '../chats/ChatInput'
import { chatInputStrings } from '../../locales/en/ComponentStrings/ChatInputStrings'

jest.mock('../TextBox', () => {
  const PropTypes = require('prop-types')
  const MockTextBox = ({
    placeholder,
    value,
    onChange,
    onKeyDown,
    disabled,
  }) => (
    <input
      data-testid="mock-text-box"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
    />
  )

  MockTextBox.propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    disabled: PropTypes.bool,
  }

  return MockTextBox
})

jest.mock('../GenericButton', () => {
  const PropTypes = require('prop-types')
  const MockGenericButton = ({ children, onClick, disabled }) => (
    <button data-testid="mock-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )

  MockGenericButton.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
  }

  return MockGenericButton
})

jest.mock('../../locales/en/ComponentStrings/ChatInputStrings', () => ({
  chatInputStrings: {
    placeholder: 'Type a message...',
    closed: 'Chat is closed',
    connecting: 'Connecting...',
    deleted: 'Chat is deleted',
    sendButton: 'Send',
  },
}))

describe('ChatInput', () => {
  const defaultProps = {
    input: '',
    setInput: jest.fn(),
    onSendMessage: jest.fn(),
    isClosed: false,
    isConnected: true,
    isDeleted: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly in the default state', () => {
    render(<ChatInput {...defaultProps} />)
    expect(
      screen.getByPlaceholderText(chatInputStrings.placeholder)
    ).toBeInTheDocument()
    expect(screen.getByText(chatInputStrings.sendButton)).toBeInTheDocument()
  })

  it('switches placeholders based on room status', () => {
    const { rerender } = render(
      <ChatInput {...defaultProps} isConnected={false} />
    )
    expect(
      screen.getByPlaceholderText(chatInputStrings.connecting)
    ).toBeInTheDocument()

    rerender(<ChatInput {...defaultProps} isClosed={true} />)
    expect(
      screen.getByPlaceholderText(chatInputStrings.closed)
    ).toBeInTheDocument()

    rerender(<ChatInput {...defaultProps} isDeleted={true} />)
    expect(
      screen.getByPlaceholderText(chatInputStrings.deleted)
    ).toBeInTheDocument()
  })

  it('disables the send button when input is empty or just whitespace', () => {
    render(<ChatInput {...defaultProps} input="   " />)
    expect(screen.getByTestId('mock-button')).toBeDisabled()
  })

  it('triggers onSendMessage when Enter is pressed', () => {
    render(<ChatInput {...defaultProps} input="Hello" />)
    const input = screen.getByTestId('mock-text-box')

    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })
    expect(defaultProps.onSendMessage).toHaveBeenCalledTimes(1)
  })

  it('does not trigger onSendMessage when Shift+Enter is pressed', () => {
    render(<ChatInput {...defaultProps} input="Hello" />)
    const input = screen.getByTestId('mock-text-box')

    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(defaultProps.onSendMessage).not.toHaveBeenCalled()
  })

  it('disables input field when room is closed, deleted, or disconnected', () => {
    const { rerender } = render(<ChatInput {...defaultProps} isClosed={true} />)
    expect(screen.getByTestId('mock-text-box')).toBeDisabled()

    rerender(<ChatInput {...defaultProps} isConnected={false} />)
    expect(screen.getByTestId('mock-text-box')).toBeDisabled()
  })
})
