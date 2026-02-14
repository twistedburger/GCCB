import PropTypes from 'prop-types'
import GenericButton from './GenericButton.jsx'
import { AccountCircleOutlined } from '@mui/icons-material'

function OrganizerCard({
  user,
  event,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) {
  const { name, nickname, role, profile_pic: profilePic } = user
  const { description: eventDescription } = event

  return (
    <div
      className={`flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white ${className || ''}`}
    >
      <div className="flex p-4 gap-4">
        <div className="shrink-0 flex items-start justify-center">
          {profilePic ? (
            <img
              src={profilePic}
              alt={`${name} profile`}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <AccountCircleOutlined
              fontSize="large"
              className="text-text-secondary"
            />
          )}
        </div>

        <div className="border-r text-text-secondary -my-1"></div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-lg text-text-primary truncate">
              {name}
            </h3>

            {nickname && (
              <span className="text-xs text-text-secondary truncate">
                ({nickname})
              </span>
            )}

            {role && (
              <span className="ml-auto text-xs text-text-secondary whitespace-nowrap">
                {role}
              </span>
            )}
          </div>

          <span className="text-xs text-text-secondary mt-1">
            {eventDescription || 'Event description missing.'}
          </span>

          {(primaryActionLabel || secondaryActionLabel) && (
            <div className="flex gap-2 mt-3">
              {primaryActionLabel && (
                <GenericButton onClick={onPrimaryAction}>
                  {primaryActionLabel}
                </GenericButton>
              )}

              {secondaryActionLabel && (
                <GenericButton
                  onClick={onSecondaryAction}
                  className="bg-medium-grey text-text-primary"
                >
                  {secondaryActionLabel}
                </GenericButton>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

OrganizerCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string,
    role: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    nickname: PropTypes.string.isRequired,
    description: PropTypes.string,
    active: PropTypes.bool.isRequired,
    profile_pic: PropTypes.string,
  }).isRequired,

  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    creator_id: PropTypes.number,
    event_time: PropTypes.string,
    location: PropTypes.string,
    verified: PropTypes.bool,
    need_approval: PropTypes.bool,
    description: PropTypes.string,
    rejection_reason: PropTypes.string,
  }).isRequired,

  primaryActionLabel: PropTypes.string,
  onPrimaryAction: PropTypes.func,
  secondaryActionLabel: PropTypes.string,
  onSecondaryAction: PropTypes.func,

  className: PropTypes.string,
}

export default OrganizerCard
