import PropTypes from 'prop-types'
import GenericButton from './GenericButton.jsx'
import ProfileInfo from './ProfileInfo'
import { useState } from 'react'
import ProfileModal from './ProfileModal.jsx'
import GenericCard from './GenericCard.jsx'

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
 * @param {Function} setAlert - The function to set the alert message.
 * @param {boolean} showDescription - Whether to show the user's description or not in their profile information.
 * @param {boolean} isClickable - If the user card should be clickable or not.
 * @param {string} profileInfoSize - The size of the profile information, sm or md.
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
  setAlert,
  showDescription = true,
  isClickable = true,
  profileInfoSize = 'sm',
}) {
  const [openModal, setOpenModal] = useState(false)

  return (
    <div>
      <ProfileModal
        user={user}
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        setAlert={setAlert}
      />
      <GenericCard
        onClick={isClickable ? () => setOpenModal(true) : undefined}
        customStyling={`${className} ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex p-4 pt-4 gap-4">
          <div className="flex flex-wrap items-start w-full gap-4">
            <div className="min-w-0 flex-1">
              <ProfileInfo
                user={user}
                size={profileInfoSize}
                showDesc={showDescription}
              />
            </div>
            {(primaryActionLabel || secondaryActionLabel) && (
              <div className="flex flex-col gap-2 ml-auto max-[500px]:w-full">
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
      </GenericCard>
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

  setAlert: PropTypes.func,
  showDescription: PropTypes.bool,
  isClickable: PropTypes.bool,
  profileInfoSize: PropTypes.string,
}

export default UserCard
