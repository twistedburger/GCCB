import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProfilePicture from '../ProfilePicture'

const baseProps = {
  onImageClick: jest.fn(),
}

describe('ProfilePicture Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the profile picture button', () => {
    render(<ProfilePicture {...baseProps} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders the default person icon when no avatarUrl is provided', () => {
    render(<ProfilePicture {...baseProps} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders the default person icon when avatarUrl is an empty string', () => {
    render(<ProfilePicture {...baseProps} avatarUrl="" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders the profile image when avatarUrl is provided', () => {
    render(
      <ProfilePicture
        {...baseProps}
        avatarUrl="https://example.com/avatar.jpg"
      />
    )
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('renders the profile image with correct alt text', () => {
    render(
      <ProfilePicture
        {...baseProps}
        avatarUrl="https://example.com/avatar.jpg"
      />
    )
    expect(screen.getByAltText('Profile')).toBeInTheDocument()
  })

  it('renders the edit icon button', () => {
    render(<ProfilePicture {...baseProps} />)
    const editIcon = document.querySelector('[data-testid="EditIcon"]')
    expect(editIcon).toBeInTheDocument()
  })

  it('calls onImageClick when the button is clicked', () => {
    const onImageClick = jest.fn()
    render(<ProfilePicture {...baseProps} onImageClick={onImageClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onImageClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onImageClick when not clicked', () => {
    const onImageClick = jest.fn()
    render(<ProfilePicture {...baseProps} onImageClick={onImageClick} />)
    expect(onImageClick).not.toHaveBeenCalled()
  })
})
