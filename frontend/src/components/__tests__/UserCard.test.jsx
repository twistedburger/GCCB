import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserCard from '../UserCard'

const mockUser = {
  id: 1,
  email: 'jane@example.com',
  role: 'user',
  name: 'Jane Doe',
  nickname: 'janedoe',
  description: 'Cool commuter!',
  active: true,
  profile_pic: 'https://example.com/avatar.jpg',
}

jest.mock('../ProfileModal.jsx', () => {
  const PropTypes = require('prop-types')

  const MockProfileModal = ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="profile-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null

  MockProfileModal.displayName = 'MockProfileModal'

  MockProfileModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
  }

  return MockProfileModal
})

jest.mock('../ProfileInfo', () => {
  const PropTypes = require('prop-types')

  const MockProfileInfo = ({ user, size, showDesc }) => (
    <div
      data-testid="profile-info"
      data-size={size}
      data-show-desc={String(showDesc)}
    >
      {user?.name}
    </div>
  )

  MockProfileInfo.displayName = 'MockProfileInfo'

  MockProfileInfo.propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
    }),
    size: PropTypes.string,
    showDesc: PropTypes.bool,
  }

  return MockProfileInfo
})

jest.mock('../GenericButton.jsx', () => {
  const PropTypes = require('prop-types')

  const MockGenericButton = ({ children, onClick, customStyling }) => (
    <button onClick={onClick} className={customStyling}>
      {children}
    </button>
  )

  MockGenericButton.displayName = 'MockGenericButton'

  MockGenericButton.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    customStyling: PropTypes.string,
  }

  return MockGenericButton
})

const baseProps = {
  user: mockUser,
  setAlert: jest.fn(),
}

describe('UserCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the ProfileInfo with the correct user', () => {
    render(<UserCard {...baseProps} />)
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()
  })

  it('passes size "sm" to ProfileInfo', () => {
    render(<UserCard {...baseProps} />)
    expect(screen.getByTestId('profile-info')).toHaveAttribute(
      'data-size',
      'sm'
    )
  })

  it('passes showDesc as true to ProfileInfo by default', () => {
    render(<UserCard {...baseProps} />)
    expect(screen.getByTestId('profile-info')).toHaveAttribute(
      'data-show-desc',
      'true'
    )
  })

  it('passes showDesc as false to ProfileInfo when showDescription is false', () => {
    render(<UserCard {...baseProps} showDescription={false} />)
    expect(screen.getByTestId('profile-info')).toHaveAttribute(
      'data-show-desc',
      'false'
    )
  })

  it('does not render the profile modal by default', () => {
    render(<UserCard {...baseProps} />)
    expect(screen.queryByTestId('profile-modal')).not.toBeInTheDocument()
  })

  it('opens the profile modal when the card is clicked', () => {
    render(<UserCard {...baseProps} />)
    fireEvent.click(screen.getByText(mockUser.name))
    expect(screen.getByTestId('profile-modal')).toBeInTheDocument()
  })

  it('closes the profile modal when onClose is called', () => {
    render(<UserCard {...baseProps} />)
    fireEvent.click(screen.getByText(mockUser.name))
    expect(screen.getByTestId('profile-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Close Modal'))
    expect(screen.queryByTestId('profile-modal')).not.toBeInTheDocument()
  })

  it('renders the primary action button when primaryActionLabel is provided', () => {
    render(
      <UserCard
        {...baseProps}
        primaryActionLabel="Accept"
        onPrimaryAction={jest.fn()}
      />
    )
    expect(screen.getByText('Accept')).toBeInTheDocument()
  })

  it('renders the secondary action button when secondaryActionLabel is provided', () => {
    render(
      <UserCard
        {...baseProps}
        secondaryActionLabel="Decline"
        onSecondaryAction={jest.fn()}
      />
    )
    expect(screen.getByText('Decline')).toBeInTheDocument()
  })

  it('does not render action buttons when no labels are provided', () => {
    render(<UserCard {...baseProps} />)
    expect(screen.queryByText('Accept')).not.toBeInTheDocument()
    expect(screen.queryByText('Decline')).not.toBeInTheDocument()
  })

  it('calls onPrimaryAction when the primary button is clicked', () => {
    const onPrimaryAction = jest.fn()
    render(
      <UserCard
        {...baseProps}
        primaryActionLabel="Accept"
        onPrimaryAction={onPrimaryAction}
      />
    )
    fireEvent.click(screen.getByText('Accept'))
    expect(onPrimaryAction).toHaveBeenCalledTimes(1)
  })

  it('calls onSecondaryAction when the secondary button is clicked', () => {
    const onSecondaryAction = jest.fn()
    render(
      <UserCard
        {...baseProps}
        secondaryActionLabel="Decline"
        onSecondaryAction={onSecondaryAction}
      />
    )
    fireEvent.click(screen.getByText('Decline'))
    expect(onSecondaryAction).toHaveBeenCalledTimes(1)
  })

  it('applies the primaryButtonStyling to the primary button', () => {
    render(
      <UserCard
        {...baseProps}
        primaryActionLabel="Accept"
        primaryButtonStyling="bg-green-500"
      />
    )
    expect(screen.getByText('Accept')).toHaveClass('bg-green-500')
  })

  it('applies the secondaryButtonStyling to the secondary button', () => {
    render(
      <UserCard
        {...baseProps}
        secondaryActionLabel="Decline"
        secondaryButtonStyling="bg-red-500"
      />
    )
    expect(screen.getByText('Decline')).toHaveClass('bg-red-500')
  })
})
