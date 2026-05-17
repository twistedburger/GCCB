import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProfileModal from '../ProfileModal'
import { profileModalStrings } from '../../locales/en/ComponentStrings/ProfileModalStrings'

const mockCurrentUser = { id: 1, role: 'ADMIN' }
const mockUser = { id: 2, role: 'user', name: 'Jane Doe', nickname: 'janedoe' }

jest.mock('../../../context/UserContext.jsx', () => ({
  useUser: () => ({ user: mockCurrentUser }),
}))

jest.mock('../../hooks/Authorization.jsx', () => ({
  authLevel: {
    ADMIN: { value: 10 },
    MODERATOR: { value: 5 },
    USER: { value: 1 },
  },
}))

jest.mock('../Modal', () => {
  const PropTypes = require('prop-types')

  const MockModal = ({ isOpen, children }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null

  MockModal.displayName = 'MockModal'

  MockModal.propTypes = {
    isOpen: PropTypes.bool,
    children: PropTypes.node,
  }

  return MockModal
})

jest.mock('../ProfileInfo', () => {
  const PropTypes = require('prop-types')

  const MockProfileInfo = ({ user, actions }) => (
    <div data-testid="profile-info">
      <span>{user?.name}</span>
      <div data-testid="profile-actions">{actions}</div>
    </div>
  )

  MockProfileInfo.displayName = 'MockProfileInfo'

  MockProfileInfo.propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
    }),
    actions: PropTypes.node,
  }

  return MockProfileInfo
})

jest.mock('../BadgeCard.jsx', () => {
  const PropTypes = require('prop-types')

  const MockBadgeCard = ({ badge }) => (
    <div data-testid="badge-card">{badge.name}</div>
  )

  MockBadgeCard.displayName = 'MockBadgeCard'

  MockBadgeCard.propTypes = {
    badge: PropTypes.shape({
      name: PropTypes.string,
    }),
  }

  return MockBadgeCard
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
  isOpen: true,
  onClose: jest.fn(),
  setAlert: jest.fn(),
}

const mockFetch = (overrides = {}) => {
  global.fetch = jest.fn(url => {
    if (url.includes('blockStatus')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ isBlocked: false, ...overrides.blockStatus }),
      })
    }
    if (url.includes('badges')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ badges: [], ...overrides.badges }),
      })
    }
    if (url.includes('blockUser') || url.includes('unblockUser')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        ...overrides.toggleBlock,
      })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
}

describe('ProfileModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch()
  })

  it('renders nothing when isOpen is false', () => {
    render(<ProfileModal {...baseProps} isOpen={false} />)
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('renders the modal when isOpen is true', async () => {
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })
  })

  it('renders ProfileInfo with the correct user', async () => {
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
    })
  })

  it('renders the no badges message when the user has no earned badges', async () => {
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByText(profileModalStrings.noBadges)).toBeInTheDocument()
    })
  })

  it('renders badge cards when the user has earned badges', async () => {
    mockFetch({
      badges: {
        badges: [
          { id: 1, name: 'First Post', earned: true, dateEarned: '2024-01-01' },
          {
            id: 2,
            name: 'Contributor',
            earned: true,
            dateEarned: '2024-02-01',
          },
        ],
      },
    })
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getAllByTestId('badge-card')).toHaveLength(2)
    })
  })

  it('renders at most 3 recent badges even when more are earned', async () => {
    mockFetch({
      badges: {
        badges: [
          { id: 1, name: 'Badge A', earned: true, dateEarned: '2024-01-01' },
          { id: 2, name: 'Badge B', earned: true, dateEarned: '2024-02-01' },
          { id: 3, name: 'Badge C', earned: true, dateEarned: '2024-03-01' },
          { id: 4, name: 'Badge D', earned: true, dateEarned: '2024-04-01' },
        ],
      },
    })
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getAllByTestId('badge-card')).toHaveLength(3)
    })
  })

  it('does not render unearned badges', async () => {
    mockFetch({
      badges: {
        badges: [
          { id: 1, name: 'Locked Badge', earned: false },
          {
            id: 2,
            name: 'Earned Badge',
            earned: true,
            dateEarned: '2024-01-01',
          },
        ],
      },
    })
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getAllByTestId('badge-card')).toHaveLength(1)
      expect(screen.getByText('Earned Badge')).toBeInTheDocument()
    })
  })

  it('renders the block button when the current user can block the target user', async () => {
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByText(profileModalStrings.block)).toBeInTheDocument()
    })
  })

  it('does not render the block button when viewing own profile', async () => {
    render(
      <ProfileModal
        {...baseProps}
        user={{ ...mockUser, id: mockCurrentUser.id }}
      />
    )
    await waitFor(() => {
      expect(
        screen.queryByText(profileModalStrings.block)
      ).not.toBeInTheDocument()
    })
  })

  it('does not render the block button when target user role is above block threshold', async () => {
    render(
      <ProfileModal {...baseProps} user={{ ...mockUser, role: 'ADMIN' }} />
    )
    await waitFor(() => {
      expect(
        screen.queryByText(profileModalStrings.block)
      ).not.toBeInTheDocument()
    })
  })

  it('renders the unblock button when the target user is already blocked', async () => {
    mockFetch({ blockStatus: { isBlocked: true } })
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => {
      expect(screen.getByText(profileModalStrings.unblock)).toBeInTheDocument()
    })
  })

  it('calls onClose and setAlert with success on successful block', async () => {
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => screen.getByText(profileModalStrings.block))
    fireEvent.click(screen.getByText(profileModalStrings.block))
    await waitFor(() => {
      expect(baseProps.onClose).toHaveBeenCalledTimes(1)
      expect(baseProps.setAlert).toHaveBeenCalledWith({
        type: 'success',
        message: profileModalStrings.errors.successfulBlock,
      })
    })
  })

  it('calls onClose and setAlert with success on successful unblock', async () => {
    mockFetch({ blockStatus: { isBlocked: true } })
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => screen.getByText(profileModalStrings.unblock))
    fireEvent.click(screen.getByText(profileModalStrings.unblock))
    await waitFor(() => {
      expect(baseProps.onClose).toHaveBeenCalledTimes(1)
      expect(baseProps.setAlert).toHaveBeenCalledWith({
        type: 'success',
        message: profileModalStrings.errors.successfulUnblock,
      })
    })
  })

  it('calls setAlert with an error when the block request fails', async () => {
    mockFetch({
      toggleBlock: {
        ok: false,
        json: () => Promise.resolve({ error: 'Failed' }),
      },
    })
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => screen.getByText(profileModalStrings.block))
    fireEvent.click(screen.getByText(profileModalStrings.block))
    await waitFor(() => {
      expect(baseProps.setAlert).toHaveBeenCalledWith({
        type: 'error',
        message: profileModalStrings.errors.failedBlocked,
      })
    })
  })

  it('calls setAlert with an error when the unblock request fails', async () => {
    mockFetch({
      blockStatus: { isBlocked: true },
      toggleBlock: {
        ok: false,
        json: () => Promise.resolve({ error: 'Failed' }),
      },
    })
    render(<ProfileModal {...baseProps} />)
    await waitFor(() => screen.getByText(profileModalStrings.unblock))
    fireEvent.click(screen.getByText(profileModalStrings.unblock))
    await waitFor(() => {
      expect(baseProps.setAlert).toHaveBeenCalledWith({
        type: 'error',
        message: profileModalStrings.errors.failedUnblocked,
      })
    })
  })

  it('does not fetch block status when viewing own profile', async () => {
    render(
      <ProfileModal
        {...baseProps}
        user={{ ...mockUser, id: mockCurrentUser.id }}
      />
    )
    await waitFor(() => {
      const blockStatusCalls = global.fetch.mock.calls.filter(([url]) =>
        url.includes('blockStatus')
      )
      expect(blockStatusCalls).toHaveLength(0)
    })
  })
})
