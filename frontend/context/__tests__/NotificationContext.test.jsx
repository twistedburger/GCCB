import { render, screen, act, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { NotificationProvider, useNotifications } from '../NotificationContext'
import { loadNotifications } from '../../src/utils/NotificationUtils'

jest.mock('../../src/utils/NotificationUtils', () => ({
  loadNotifications: jest.fn(),
}))

const mockEventSource = {
  onmessage: null,
  onerror: null,
  close: jest.fn(),
}
global.EventSource = jest.fn(() => mockEventSource)

const wrapper = ({ children }) => (
  <NotificationProvider>{children}</NotificationProvider>
)

describe('NotificationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders children', () => {
    render(
      <NotificationProvider>
        <div>test child</div>
      </NotificationProvider>
    )
    expect(screen.getByText('test child')).toBeInTheDocument()
  })

  test('calls loadNotifications on mount', () => {
    render(
      <NotificationProvider>
        <div />
      </NotificationProvider>
    )
    expect(loadNotifications).toHaveBeenCalledWith(expect.any(Function))
  })

  test('opens an EventSource stream on mount', () => {
    render(
      <NotificationProvider>
        <div />
      </NotificationProvider>
    )
    expect(global.EventSource).toHaveBeenCalledWith(
      expect.stringContaining('/notifications/listenForNotifications'),
      { withCredentials: true }
    )
  })

  test('sets notifications when a valid message is received', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper })

    const mockNotifications = [{ _id: '1', title: 'Test' }]
    act(() => {
      mockEventSource.onmessage({
        data: JSON.stringify({ notifications: mockNotifications }),
      })
    })

    await waitFor(() => {
      expect(result.current.notifications).toEqual(mockNotifications)
    })
  })

  test('sets notifications to empty array on error response', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper })

    act(() => {
      mockEventSource.onmessage({
        data: JSON.stringify({ error: 'Something went wrong' }),
      })
    })

    await waitFor(() => {
      expect(result.current.notifications).toEqual([])
    })
  })

  test('closes the stream on error', () => {
    render(
      <NotificationProvider>
        <div />
      </NotificationProvider>
    )

    act(() => {
      mockEventSource.onerror()
    })

    expect(mockEventSource.close).toHaveBeenCalled()
  })

  test('closes the stream on unmount', () => {
    const { unmount } = render(
      <NotificationProvider>
        <div />
      </NotificationProvider>
    )
    unmount()
    expect(mockEventSource.close).toHaveBeenCalled()
  })

  test('exposes setNotifications via context', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper })

    act(() => {
      result.current.setNotifications([{ _id: '2', title: 'Manual' }])
    })

    await waitFor(() => {
      expect(result.current.notifications).toEqual([
        { _id: '2', title: 'Manual' },
      ])
    })
  })

  test('useNotifications returns null when used outside provider', () => {
    const { result } = renderHook(() => useNotifications())
    expect(result.current).toBeNull()
  })
})
