import { render, screen } from '@testing-library/react'
import ProfileInfo from '../ProfileInfo'

jest.mock('@mui/material', () => {
  const PropTypes = require('prop-types')

  const MockAvatar = ({ src, sx }) => (
    <img
      data-testid="avatar"
      src={src}
      style={{ width: sx?.width, height: sx?.height }}
      alt="avatar"
    />
  )

  MockAvatar.propTypes = {
    src: PropTypes.string,
    sx: PropTypes.shape({
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }

  return { Avatar: MockAvatar }
})

jest.mock('../../locales/en/AnalyticsStrings', () => ({
  analyticsStrings: {
    dashboard: {
      profile: {
        unknownName: 'Unknown User',
        unknownNickname: 'No Nickname',
        noDescription: 'No profile description added yet.',
      },
    },
  },
}))

const mockUser = {
  name: 'Jane Doe',
  nickname: 'janedoe',
  role: 'admin',
  description: 'Cool commuter!',
  profile_pic: 'https://example.com/avatar.jpg',
}

describe('ProfileInfo', () => {
  describe('with a fully populated user', () => {
    beforeEach(() => render(<ProfileInfo user={mockUser} />))

    it('renders the user name', () => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    it('renders the user nickname with @ prefix', () => {
      expect(screen.getByText('@janedoe')).toBeInTheDocument()
    })

    it('renders the user role', () => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    it('renders the user description', () => {
      expect(screen.getByText('Cool commuter!')).toBeInTheDocument()
    })

    it('renders the avatar with the correct src', () => {
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })
  })

  describe('with no user provided', () => {
    beforeEach(() => render(<ProfileInfo />))

    it('falls back to the unknown user string', () => {
      expect(screen.getByText('Unknown User')).toBeInTheDocument()
    })

    it('falls back to the no nickname string', () => {
      expect(screen.getByText('@No Nickname')).toBeInTheDocument()
    })

    it('falls back to the "user" role', () => {
      expect(screen.getByText('user')).toBeInTheDocument()
    })

    it('falls back to the no profile description string', () => {
      expect(
        screen.getByText('No profile description added yet.')
      ).toBeInTheDocument()
    })
  })

  describe('showDesc parameter', () => {
    it('shows the description by default', () => {
      render(<ProfileInfo user={mockUser} />)
      expect(screen.getByText('Cool commuter!')).toBeInTheDocument()
    })

    it('hides the description when showDesc is false', () => {
      render(<ProfileInfo user={mockUser} showDesc={false} />)
      expect(screen.queryByText('Cool commuter!')).not.toBeInTheDocument()
    })

    it('shows the description when showDesc is explicitly true', () => {
      render(<ProfileInfo user={mockUser} showDesc={true} />)
      expect(screen.getByText('Cool commuter!')).toBeInTheDocument()
    })
  })

  describe('size parameter', () => {
    it('renders with the default "md" size without errors', () => {
      render(<ProfileInfo user={mockUser} size="md" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ width: '100px' })
    })

    it('renders with the "sm" size and applies a smaller avatar', () => {
      render(<ProfileInfo user={mockUser} size="sm" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ width: '50px' })
    })

    it('falls back to "md" size for an unknown size value', () => {
      render(<ProfileInfo user={mockUser} size="xl" />)
      expect(screen.getByTestId('avatar')).toHaveStyle({ width: '100px' })
    })
  })

  describe('actions parameter', () => {
    it('renders the actions slot when provided', () => {
      render(
        <ProfileInfo user={mockUser} actions={<button>Edit Profile</button>} />
      )
      expect(
        screen.getByRole('button', { name: 'Edit Profile' })
      ).toBeInTheDocument()
    })

    it('renders nothing in the actions slot when not provided', () => {
      render(<ProfileInfo user={mockUser} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
