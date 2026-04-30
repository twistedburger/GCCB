import { render, act } from '@testing-library/react'
import CreateUser from '../CreateUser'
import ProfileForm from '../../components/ProfileForm'

const mockOnUserCreated = jest.fn()
jest.mock('../../components/ProfileForm', () => jest.fn(() => null))

const mockUser = { user: { name: 'Jane Doe' } }

const mockFetchResponse = (isOk, body = {}) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: isOk,
    json: jest.fn().mockResolvedValue(body),
  })
}

describe('Test CreateUser Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  afterEach(() => jest.restoreAllMocks())

  test('Renders ProfileForm', () => {
    render(
      <CreateUser ssoUser={mockUser.user} onUserCreated={mockOnUserCreated} />
    )
    expect(ProfileForm).toHaveBeenCalledWith(
      expect.objectContaining({
        user: mockUser.user,
        isNew: true,
        onSubmit: expect.any(Function),
      }),
      undefined
    )
  })

  const getInsertUserCallback = () => ProfileForm.mock.calls[0][0].onSubmit
  const formData = { name: 'Jane Doe', email: 'JaneDoe@test.com' }

  test('Callback calls onUserCreated after call to api', async () => {
    mockFetchResponse(true, mockUser)
    render(
      <CreateUser ssoUser={mockUser.user} onUserCreated={mockOnUserCreated} />
    )

    await act(async () => {
      await getInsertUserCallback()(formData)
    })

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.VITE_API_BASE_URL}/createNewUser`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      }
    )
    expect(mockOnUserCreated).toHaveBeenCalledWith(mockUser.user)
  })

  test('Callback api fetch not ok and doesnt call onUserCreated', async () => {
    mockFetchResponse(false, mockUser)
    render(
      <CreateUser ssoUser={mockUser.user} onUserCreated={mockOnUserCreated} />
    )

    await act(async () => {
      await getInsertUserCallback()(formData)
    })

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.VITE_API_BASE_URL}/createNewUser`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      }
    )
    expect(mockOnUserCreated).not.toHaveBeenCalled()
  })
})
