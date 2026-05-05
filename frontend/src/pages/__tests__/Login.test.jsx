import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../Login'
import { loginStrings } from '../../locales/en/loginLocales'
import { getSSOProviders, redirect } from '../../utils/LoginUtils'

jest.mock('../../utils/LoginUtils', () => ({
  getSSOProviders: jest.fn(),
  redirect: jest.fn(),
}))

const mockProviders = [
  { value: 'UBC_Connection', label: 'UBC' },
  { value: 'SFU_Connection', label: 'SFU' },
]

describe('Test Login Page', () => {
  beforeEach(() => {
    getSSOProviders.mockResolvedValue(mockProviders)
  })

  test('renders welcome message', () => {
    render(<Login />)
    expect(screen.getByText(loginStrings.welcome)).toBeInTheDocument()
  })

  test('loads and displays SSO providers in dropdown', async () => {
    render(<Login />)
    await waitFor(() => {
      expect(getSSOProviders).toHaveBeenCalled()
    })

    await userEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(screen.getByText('UBC')).toBeInTheDocument()
      expect(screen.getByText('SFU')).toBeInTheDocument()
    })
  })

  test('calls getSSOProviders with user input when searching', async () => {
    render(<Login />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.type(screen.getByRole('combobox'), 'UBC')

    await waitFor(() => {
      expect(getSSOProviders).toHaveBeenCalledWith('UBC', expect.any(Function))
    })
  })

  test('shows error message when submitting with no selection', async () => {
    render(<Login />)

    await userEvent.click(screen.getByRole('button'))

    expect(screen.getByText(loginStrings.error)).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })

  test('redirects when submitting with valid selection', async () => {
    render(<Login />)

    await userEvent.click(screen.getByRole('combobox'))
    await waitFor(() => screen.getByText('UBC'))
    await userEvent.click(screen.getByText('UBC'))

    await userEvent.click(screen.getByRole('button'))

    expect(redirect).toHaveBeenCalledWith(
      'http://localhost:3000/loginRoute?connection=UBC_Connection'
    )
    expect(screen.queryByText(loginStrings.error)).not.toBeInTheDocument()
  })

  test('shows empty dropdown when getSSOProviders returns empty list', async () => {
    getSSOProviders.mockResolvedValue([])
    render(<Login />)

    await userEvent.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(getSSOProviders).toHaveBeenCalled()
    })

    expect(screen.queryByText('UBC')).not.toBeInTheDocument()
    expect(screen.queryByText('SFU')).not.toBeInTheDocument()
  })
})
