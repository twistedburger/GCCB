import { render, screen, fireEvent } from '@testing-library/react'
import ProfileForm from '../../components/ProfileForm'

const mockUser = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  nickname: 'speedy',
  description: 'I love cycling',
}

describe('ProfileForm', () => {
  const onSubmit = jest.fn()
  const onCancel = jest.fn()

  const renderForm = (props = {}) =>
    render(
      <ProfileForm
        user={mockUser}
        isNew={false}
        onSubmit={onSubmit}
        onCancel={onCancel}
        {...props}
      />
    )

  //create/edit render tests

  test('shows "Create Profile" heading when isNew is true', () => {
    renderForm({ isNew: true })
    expect(screen.getByText('Create Profile')).toBeInTheDocument()
  })

  test('shows "Edit Profile" heading when isNew is false', () => {
    renderForm()
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
  })

  test('hides back button when isNew is true', () => {
    renderForm({ isNew: true })
    expect(screen.queryByTestId('ArrowBackIosNewIcon')).not.toBeInTheDocument()
  })

  test('shows back button when isNew is false', () => {
    renderForm()
    expect(screen.getByTestId('ArrowBackIosNewIcon')).toBeInTheDocument()
  })

  //form field tests

  test('renders name and email fields as disabled', () => {
    renderForm()
    expect(screen.getByDisplayValue(mockUser.name)).toBeDisabled()
    expect(screen.getByDisplayValue(mockUser.email)).toBeDisabled()
  })

  test('renders nickname and description fields as editable', () => {
    renderForm()
    expect(screen.getByDisplayValue(mockUser.nickname)).not.toBeDisabled()
    expect(screen.getByDisplayValue(mockUser.description)).not.toBeDisabled()
  })

  test('populates fields with user data', () => {
    renderForm()
    expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockUser.nickname)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockUser.description)).toBeInTheDocument()
  })

  test('renders empty fields when no user is provided', () => {
    renderForm({ user: null })
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => expect(input.value).toBe(''))
  })

  test('updates nickname field on change', () => {
    renderForm()
    const nicknameInput = screen.getByDisplayValue(mockUser.nickname)
    fireEvent.change(nicknameInput, {
      target: { name: 'nickname', value: 'newNick' },
    })
    expect(nicknameInput.value).toBe('newNick')
  })

  test('updates description field on change', () => {
    renderForm()
    const descriptionInput = screen.getByDisplayValue(mockUser.description)
    fireEvent.change(descriptionInput, {
      target: { name: 'description', value: 'New description' },
    })
    expect(descriptionInput.value).toBe('New description')
  })

  //nickname validation tests

  test('shows error when nickname is already taken', () => {
    renderForm()
    const nicknameInput = screen.getByDisplayValue(mockUser.nickname)
    fireEvent.blur(nicknameInput, { target: { value: 'justJam' } })
    expect(screen.getByText('Nickname is already taken.')).toBeInTheDocument()
  })

  test('clears error when nickname is not taken', () => {
    renderForm()
    const nicknameInput = screen.getByDisplayValue(mockUser.nickname)
    fireEvent.blur(nicknameInput, { target: { value: 'justJam' } })
    expect(screen.getByText('Nickname is already taken.')).toBeInTheDocument()

    fireEvent.blur(nicknameInput, {
      target: { value: 'random&8dsfn932nickname' },
    })
    expect(
      screen.queryByText('Nickname is already taken.')
    ).not.toBeInTheDocument()
  })

  test('disables Save Changes button when nickname error exists', () => {
    renderForm()
    const nicknameInput = screen.getByDisplayValue(mockUser.nickname)
    fireEvent.blur(nicknameInput, { target: { value: 'justJam' } })
    expect(screen.getByText('Save Changes')).toBeDisabled()
  })

  test('enables Save Changes button when no nickname error', () => {
    renderForm()
    expect(screen.getByText('Save Changes')).not.toBeDisabled()
  })

  //back button tests

  test('calls onCancel when back button is clicked', () => {
    renderForm()
    fireEvent.click(screen.getByTestId('ArrowBackIosNewIcon').closest('button'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  test('resets form to original user data when back is clicked', () => {
    renderForm()
    const nicknameInput = screen.getByDisplayValue(mockUser.nickname)
    fireEvent.change(nicknameInput, {
      target: { name: 'nickname', value: 'changedNick' },
    })
    expect(nicknameInput.value).toBe('changedNick')

    fireEvent.click(screen.getByTestId('ArrowBackIosNewIcon').closest('button'))
    expect(screen.getByDisplayValue(mockUser.nickname)).toBeInTheDocument()
  })

  //submit tests

  test('calls onSubmit with form data when Save Changes is clicked', () => {
    renderForm()
    fireEvent.click(screen.getByText('Save Changes'))
    expect(onSubmit).toHaveBeenCalledWith({
      name: mockUser.name,
      email: mockUser.email,
      nickname: mockUser.nickname,
      description: mockUser.description,
    })
  })

  test('calls onSubmit with updated nickname', () => {
    renderForm()
    const nicknameInput = screen.getByDisplayValue(mockUser.nickname)
    const descriptionInput = screen.getByDisplayValue(mockUser.description)
    fireEvent.change(nicknameInput, {
      target: { name: 'nickname', value: 'newNick' },
    })
    fireEvent.change(descriptionInput, {
      target: { name: 'description', value: 'New description' },
    })
    fireEvent.click(screen.getByText('Save Changes'))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        nickname: 'newNick',
        description: 'New description',
      })
    )
  })
})
