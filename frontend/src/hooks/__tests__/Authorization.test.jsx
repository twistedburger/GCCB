import { renderHook, act } from '@testing-library/react'
import { AuthProvider, authLevel, useAuth } from '../Authorization'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
const mockFetchResponse = (status, body = {}) => {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    json: jest.fn().mockResolvedValue(body),
  })
}

describe('Test authorizeUser', () => {
  afterEach(() => jest.restoreAllMocks())
  test('user authorization level is returned from the server', async () => {
    mockFetchResponse(200, { authorization: authLevel.USER.label })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.authorizeUser()
    })

    expect(result.current.authorization).toBe(authLevel.USER.label)
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.VITE_API_BASE_URL}/authorize`,
      {
        credentials: 'include',
      }
    )
  })

  test.each([401, 403, 404, 500])(
    "user authorization level is set to '' if the server response status is not %i",
    async status => {
      mockFetchResponse(200, { authorization: authLevel.USER.label })
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.authorizeUser()
      })
      expect(result.current.authorization).toBe(authLevel.USER.label)

      mockFetchResponse(status)

      await act(async () => {
        await result.current.authorizeUser()
      })
      expect(result.current.authorization).toBe('')
    }
  )

  test('updates authorization if called multiple times', async () => {
    mockFetchResponse(200, { authorization: authLevel.USER.label })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.authorizeUser()
    })
    expect(result.current.authorization).toBe(authLevel.USER.label)

    mockFetchResponse(200, { authorization: authLevel.ADMIN.label })

    await act(async () => {
      await result.current.authorizeUser()
    })
    expect(result.current.authorization).toBe(authLevel.ADMIN.label)
  })
})
