import PropTypes from 'prop-types'
import GenericButton from './GenericButton.jsx'
import Modal from './Modal'
import ProfileInfo from './ProfileInfo'
import { useState } from 'react'
import { userCardStrings } from '../locales/en/ComponentStrings/UserCardStrings.js'
import { useUser } from '../../context/UserContext.jsx'

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
  setAlert,
}) {
  const [openModal, setOpenModal] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const { user: currentUser } = useUser()

  const handleBlockUser = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/blockUser', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked_user_id: user.id }),
      })

      if (response.ok) {
        setIsBlocked(true)
        setOpenModal(false)
        if (setAlert)
          setAlert({
            severity: 'success',
            message: 'User blocked successfully',
          })
      } else {
        const errorData = await response.json()
        if (setAlert) setAlert({ severity: 'error', message: errorData.error })
      }
    } catch (err) {
      console.error('Block error:', err)
      if (setAlert)
        setAlert({ severity: 'error', message: 'Failed to block user' })
    }
  }

  const handleUnblockUser = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/unblockUser', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked_user_id: user.id }),
      })

      if (response.ok) {
        setIsBlocked(false)
        setOpenModal(false)
        if (setAlert)
          setAlert({
            severity: 'success',
            message: 'User unblocked successfully',
          })
      } else {
        if (setAlert)
          setAlert({ severity: 'error', message: 'Failed to unblock user' })
      }
    } catch (err) {
      console.error('Unblock error:', err)
      if (setAlert)
        setAlert({ severity: 'error', message: 'Failed to unblock user' })
    }
  }

  const handleOpenModal = async () => {
    setOpenModal(true)
    if (isSelf) return
    try {
      const response = await fetch(
        `http://localhost:3000/api/blockStatus/${user.id}`,
        {
          credentials: 'include',
        }
      )
      const data = await response.json()
      setIsBlocked(data.isBlocked)
    } catch (err) {
      console.error('Failed to fetch block status:', err)
    }
  }

  const isSelf = currentUser && Number(currentUser.id) === Number(user.id)

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
            !isSelf && (
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
              <ProfileInfo user={user} size={'sm'}></ProfileInfo>
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
}

export default UserCard
