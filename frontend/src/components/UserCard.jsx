import PropTypes from 'prop-types'
import GenericButton from './GenericButton.jsx'
import Modal from './Modal'
import ProfileInfo from './ProfileInfo'
import { useState } from 'react'
import { userCardStrings } from '../locales/en/ComponentStrings/UserCardStrings.js'
import { useUser } from '../../context/UserContext.jsx'
import { authLevel } from '../hooks/Authorization.jsx'

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
}) {
  const baseURL = import.meta.env.VITE_API_BASE_URL
  const [openModal, setOpenModal] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const { user: currentUser } = useUser()

  const handleBlockUser = async () => {
    try {
      const response = await fetch(`${baseURL}/api/blockUser/${user.id}`, {
        credentials: 'include',
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        setIsBlocked(true)
        setOpenModal(false)
        setAlert?.({
          type: 'success',
          message: userCardStrings.errors.successfulBlock,
        })
      } else {
        setAlert?.({
          type: 'error',
          message: data.error ?? userCardStrings.errors.failedBlocked,
        })
      }
    } catch (err) {
      console.error(err)
      setAlert?.({
        type: 'error',
        message: userCardStrings.errors.failedBlocked,
      })
    }
  }

  const handleUnblockUser = async () => {
    try {
      const response = await fetch(`${baseURL}/api/unblockUser/${user.id}`, {
        credentials: 'include',
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        setIsBlocked(false)
        setOpenModal(false)
        setAlert?.({
          type: 'success',
          message: userCardStrings.errors.successfulUnblock,
        })
      } else {
        setAlert?.({
          type: 'error',
          message: data.error ?? userCardStrings.errors.failedUnblocked,
        })
      }
    } catch (err) {
      console.error(err)
      setAlert?.({
        type: 'error',
        message: userCardStrings.errors.failedUnblocked,
      })
    }
  }

  const handleOpenModal = async () => {
    setOpenModal(true)
    if (isSelf) return
    try {
      const response = await fetch(`${baseURL}/api/blockStatus/${user.id}`, {
        credentials: 'include',
      })
      const data = await response.json()
      setIsBlocked(data.isBlocked)
    } catch (err) {
      console.error(err)
      setAlert?.({
        type: 'error',
        message: userCardStrings.errors.failedBlockStatus,
      })
    }
  }

  const isSelf = currentUser && Number(currentUser.id) === Number(user.id)
  // prevent user from blocking themselves, or anyone above users (moderators, etc.)
  const canBlock =
    !isSelf &&
    authLevel[user.role?.toUpperCase()]?.value <= authLevel.USER.value

  return (
    <div>
      <Modal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false)
        }}
      >
        <ProfileInfo
          user={user}
          actions={
            canBlock && (
              <GenericButton
                onClick={isBlocked ? handleUnblockUser : handleBlockUser}
                unstyled
                customStyling={`text-xs font-medium border rounded-2xl px-4 py-1 mr-6 ${
                  isBlocked
                    ? 'text-gray-500 border-gray-500'
                    : 'text-red-500 border-red-500'
                }`}
              >
                {isBlocked ? userCardStrings.unblock : userCardStrings.block}
              </GenericButton>
            )
          }
        ></ProfileInfo>
      </Modal>
      <GenericButton
        unstyled
        customStyling={'w-full'}
        onClick={handleOpenModal}
      >
        <div
          className={`flex flex-col rounded-xl shadow-md shadow-medium-grey bg-white ${className || ''}`}
        >
          <div className="flex p-4 pt-4 gap-4">
            <div className="shrink-0 flex items-start justify-center">
              <ProfileInfo
                user={user}
                size={'sm'}
                showDesc={showDescription}
              ></ProfileInfo>
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
      </GenericButton>
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
}

export default UserCard
