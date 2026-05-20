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
function ProfileInfo({ user, showDesc = true, size = 'md' }) {
  const dashboardStrings = analyticsStrings.dashboard
  const sizes = {
    sm: {
      avatar: 50,
      container: 'w-12 h-12',
      nameSize: 'text-med',
      textSize: 'text-xs',
      margin: 'mt-2',
      gap: 'gap-2',
    },
    md: {
      avatar: 100,
      container: 'w-24 h-24',
      text: 'text-xl',
      textSize: 'text-sm',
      margin: 'mt-4',
      gap: 'gap-4',
    },
  }
  const sizeSelection = sizes[size] || sizes.md

  return (
    <div className="w-full text-left">
      <div
        className={`flex flex-row flex-wrap justify-between items-center ${sizeSelection.gap}`}
      >
        <div
          className={`flex flex-row ${sizeSelection.gap} items-center flex-1`}
        >
          <div className={`${sizeSelection.container}`}>
            <Avatar
              src={user?.profile_pic}
              sx={{ width: sizeSelection.avatar, height: sizeSelection.avatar }}
            />
          </div>
          <div>
            <div
              className={`${sizeSelection.nameSize} font-semibold text-text-primary leading-none`}
            >
              {user?.name ?? dashboardStrings.profile.unknownName}
            </div>
            <div className={`text-text-secondary ${sizeSelection.textSize}`}>
              @{user?.nickname ?? dashboardStrings.profile.unknownNickname}
            </div>
            <div
              className={`mt-1 text-blue-primary font-semibold leading-none ${sizeSelection.textSize}`}
            >
              {user?.role ?? 'user'}
            </div>
          </div>
        </div>
      </div>
      {showDesc && (
        <div
          className={`${sizeSelection.margin} ${sizeSelection.textSize} text-text-primary leading-normal`}
        >
          {user?.description ?? dashboardStrings.profile.noDescription}
        </div>
      )}
    </div>
  )
}

ProfileInfo.propTypes = {
  user: PropTypes.object,
  showDesc: PropTypes.bool,
  size: PropTypes.string,
}

export default ProfileInfo
