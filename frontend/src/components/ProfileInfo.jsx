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
function ProfileInfo({ user, actions }) {
  const dashboardStrings = analyticsStrings.dashboard
  const displayName = user?.name ?? dashboardStrings.profile.unknownName
  const displayNickname =
    user?.nickname ?? dashboardStrings.profile.unknownNickname
  const displayRole = user?.role ?? 'user'
  const displayDescription =
    user?.description ?? dashboardStrings.profile.noDescription
  const displayImage = user?.profile_pic ?? ''

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between items-start gap-4">
        <div className="flex flex-row gap-4">
          <div className="relative h-24 w-24 shrink-0">
            <Avatar src={displayImage} sx={{ width: 100, height: 100 }} />
          </div>

          <div className="flex flex-col">
            <div className="text-xl font-semibold text-text-primary leading-none">
              {displayName}
            </div>
            <div className="text-text-secondary">@{displayNickname}</div>
            <div className="mt-1 text-blue-primary font-semibold leading-none">
              {displayRole}
            </div>
          </div>
        </div>

        <div className="shrink-0">{actions}</div>
      </div>

      <div className="mt-4 text-sm text-text-primary leading-normal text">
        {displayDescription}
      </div>
    </div>
  )
}

ProfileInfo.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
}

export default ProfileInfo
