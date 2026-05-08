import PropTypes from 'prop-types'
import { Avatar } from '@mui/material'
import { analyticsStrings } from '../locales/en/AnalyticsStrings'

/**
 * A component that displays profile information such as name, nickname, user role, and description.
 *
 * @param {Object} [user] - The existing user data to populate the profile info.
 * @param {Object} [actions] - Actions to be displayed along with the profile information (blocking, editing, etc.)
 * @returns {JSX.Element}
 */
function ProfileInfo({ user, actions, size = 'md' }) {
  const dashboardStrings = analyticsStrings.dashboard
  const sizes = {
    sm: {
      avatar: 60,
      container: 'w-16 h-16',
      text: 'text-lg',
      desc: 'text-xs',
      gap: 'gap-2',
    },
    md: {
      avatar: 100,
      container: 'w-24 h-24',
      text: 'text-xl',
      desc: 'text-sm',
      gap: 'gap-4',
    },
  }
  const sizeSelection = sizes[size] || sizes.md

  return (
    <div className="w-full text-left">
      <div
        className={`flex flex-row justify-between items-start ${sizeSelection.gap}`}
      >
        <div className={`flex flex-row ${sizeSelection.gap}`}>
          <div className={`relative shrink-0 ${sizeSelection.container}`}>
            <Avatar
              src={user?.profile_pic}
              sx={{ width: sizeSelection.avatar, height: sizeSelection.avatar }}
            />
          </div>
          <div className="flex flex-col">
            <div
              className={`${sizeSelection.text} font-semibold text-text-primary leading-none`}
            >
              {user?.name ?? dashboardStrings.profile.unknownName}
            </div>
            <div className="text-text-secondary text-sm">
              @{user?.nickname ?? dashboardStrings.profile.unknownNickname}
            </div>
            <div className="mt-1 text-blue-primary font-semibold leading-none text-sm">
              {user?.role ?? 'user'}
            </div>
          </div>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
      <div
        className={`mt-4 ${sizeSelection.desc} text-text-primary leading-normal`}
      >
        {user?.description ?? dashboardStrings.profile.noDescription}
      </div>
    </div>
  )
}

ProfileInfo.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
  size: PropTypes.string,
}

export default ProfileInfo
