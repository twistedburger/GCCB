import { render, screen, fireEvent } from '@testing-library/react'
import Chats from '../Chats'
import { useLocation } from 'react-router-dom'
import { useChatRoom } from '../../hooks/UseChatRoom'
import { useUser } from '../../../context/UserContext'
import { useUnreadMessages } from '../../../context/UnreadMessagesContext'
import { chatsStrings } from '../../locales/en/ChatsStrings'

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}))

jest.mock('../../../context/UserContext', () => ({
  useUser: jest.fn(),
}))

jest.mock('../../hooks/UseChatRoom', () => ({
  useChatRoom: jest.fn(),
}))

jest.mock('../../../context/UnreadMessagesContext', () => ({
  useUnreadMessages: jest.fn(),
}))

jest.mock('../../locales/en/ChatsStrings', () => ({
  chatsStrings: {
    sidebarTitle: 'Messages',
    active: 'Active',
    archived: 'Archived',
    selectConversation: 'Select a conversation',
  },
}))

jest.mock('../../components/chats/ChatBox', () => {
  return function MockChatBox() {
    return <div data-testid="mock-chat-box" />
  }
})

describe('Chats Page', () => {
  const mockRooms = [
    { id: 'room-1', routeTitle: 'Live Chat', is_closed: false },
    { id: 'room-2', routeTitle: 'Archived Chat', is_closed: true },
  ]

  const mockChatHook = {
    rooms: mockRooms,
    activeRoom: null,
    messages: [],
    members: [],
    sidebarWidth: 300,
    isResizing: false,
    sidebarRef: { current: null },
    openRoom: jest.fn(),
    startResizing: jest.fn(),
    handleSendMessage: jest.fn(),
    setInput: jest.fn(),
    input: '',
    isConnected: true,
    isClosed: false,
    isDeleted: false,
  }

  const mockUnreadContext = {
    unreadRoomIds: new Set(),
    clearRoomUnread: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useUser.mockReturnValue({ user: { id: 'user-123' } })
    useUnreadMessages.mockReturnValue(mockUnreadContext)
    useLocation.mockReturnValue({ state: {} })
    useChatRoom.mockReturnValue(mockChatHook)
  })

  describe('Sidebar and Room List', () => {
    it('renders the sidebar title and all room cards', () => {
      render(<Chats />)
      expect(screen.getByText(chatsStrings.sidebarTitle)).toBeInTheDocument()
      expect(screen.getByText('Live Chat')).toBeInTheDocument()
      expect(screen.getByText('Archived Chat')).toBeInTheDocument()
    })

    it('displays the correct status pill (Active vs Archived)', () => {
      render(<Chats />)
      expect(screen.getByText(chatsStrings.active)).toBeInTheDocument()
      expect(screen.getByText(chatsStrings.archived)).toBeInTheDocument()
    })

    it('opens a room and clears unread status when a card is clicked', () => {
      render(<Chats />)
      fireEvent.click(screen.getByText('Live Chat'))

      expect(mockChatHook.openRoom).toHaveBeenCalledWith(mockRooms[0])
      expect(mockUnreadContext.clearRoomUnread).toHaveBeenCalledWith('room-1')
    })
  })

  describe('Layout and Resizing', () => {
    it('sets the sidebar width style from the hook state', () => {
      useChatRoom.mockReturnValue({ ...mockChatHook, sidebarWidth: 400 })
      render(<Chats />)

      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveStyle({ width: '400px' })
    })

    it('calls startResizing when the divider handle is pressed', () => {
      const { container } = render(<Chats />)
      const divider = container.querySelector('.cursor-col-resize')

      fireEvent.mouseDown(divider)
      expect(mockChatHook.startResizing).toHaveBeenCalled()
    })

    it('applies resizing classes to the root container during resize', () => {
      useChatRoom.mockReturnValue({ ...mockChatHook, isResizing: true })
      const { container } = render(<Chats />)

      expect(container.firstChild).toHaveClass(
        'cursor-col-resize',
        'select-none'
      )
    })
  })

  describe('Navigation Logic (useEffect)', () => {
    it('automatically opens a room if openRoomId is passed in location state', () => {
      useLocation.mockReturnValue({
        state: { openRoomId: 'room-1' },
      })
      render(<Chats />)
      expect(mockChatHook.openRoom).toHaveBeenCalledWith(mockRooms[0])
      expect(mockUnreadContext.clearRoomUnread).toHaveBeenCalledWith('room-1')
    })

    it('clears history state after auto-opening a room', () => {
      const historySpy = jest.spyOn(window.history, 'replaceState')
      useLocation.mockReturnValue({
        state: { openRoomId: 'room-1' },
      })
      render(<Chats />)
      expect(historySpy).toHaveBeenCalledWith({}, '')
      historySpy.mockRestore()
    })
  })

  describe('Main Content Area', () => {
    it('shows placeholder text when no room is active', () => {
      render(<Chats />)
      expect(
        screen.getByText(chatsStrings.selectConversation)
      ).toBeInTheDocument()
      expect(screen.queryByTestId('mock-chat-box')).not.toBeInTheDocument()
    })

    it('renders ChatBox when a room is active', () => {
      useChatRoom.mockReturnValue({ ...mockChatHook, activeRoom: mockRooms[0] })
      render(<Chats />)
      expect(screen.getByTestId('mock-chat-box')).toBeInTheDocument()
      expect(
        screen.queryByText(chatsStrings.selectConversation)
      ).not.toBeInTheDocument()
    })
  })
})
