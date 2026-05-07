import PropTypes from 'prop-types'
import GenericButton from './GenericButton.jsx'
import { AccountCircleOutlined } from '@mui/icons-material'
import { userCardStrings } from '../locales/en/ComponentStrings/UserCardStrings.js'

/**
 * Component to display a user card.
 *
 * @param {Object} user - The user information.
 * @param {string} primaryActionLabel - The label for the primary action button.
 * @param {Function} onPrimaryAction - The function to call when the primary action is clicked.
 * @param {string} primaryButtonStyling - Custom styling for the primary button.
 * @param {string} secondaryActionLabel - The label for the secondary action button.
 * @param {Function} onSecondaryAction - The function to call when the secondary action is clicked.
 * @param {string} secondaryButtonStyling - Custom styling for the secondary button.
 */

function UserCard({
  user,
  primaryActionLabel,
  onPrimaryAction,
  primaryButtonStyling,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryButtonStyling,
  className,
}) {
  const { name, nickname, role, description, profile_pic } = user

  return (
    <div
      className={`flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white ${className || ''}`}
    >
      <div className="flex p-4 gap-4">
        <div className="shrink-0 flex items-start justify-center">
          {profile_pic ? (
            <img
              src={profile_pic}
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

        <div className="flex border-r text-text-secondary -my-1"></div>

        <div className="flex flex-1 min-w-0 flex-row items-center">
          <div className="flex-1 min-w-0">
            <div className="flex flex-row items-center gap-1">
              <h3 className="font-semibold text-lg text-text-primary truncate">
                {name}
              </h3>
              {nickname && (
                <span className="text-xs text-text-secondary truncate">
                  ({nickname})
                </span>
              )}
              {role && (
                <span className="text-xs text-text-secondary whitespace-nowrap">
                  • {role}
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {description || userCardStrings.noBio}
            </p>
          </div>

          {(primaryActionLabel || secondaryActionLabel) && (
            <div className="flex flex-col gap-2 ml-4 shrink-0">
              {primaryActionLabel && (
                <GenericButton
                  onClick={onPrimaryAction}
                  unstyled
                  customStyling={primaryButtonStyling}
                >
                  {primaryActionLabel}
                </GenericButton>
              )}

              {secondaryActionLabel && (
                <GenericButton
                  onClick={onSecondaryAction}
                  unstyled
                  customStyling={secondaryButtonStyling}
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

UserCard.propTypes = {
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

  primaryActionLabel: PropTypes.string,
  onPrimaryAction: PropTypes.func,
  secondaryActionLabel: PropTypes.string,
  onSecondaryAction: PropTypes.func,

  className: PropTypes.string,
  primaryButtonStyling: PropTypes.string,
  secondaryButtonStyling: PropTypes.string,
}

export default UserCard
