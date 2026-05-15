import PropTypes from 'prop-types'
import { useState, useEffect, useCallback } from 'react'
import Modal from './Modal'
import ProfileInfo from './ProfileInfo'
import GenericButton from './GenericButton.jsx'
import { userCardStrings } from '../locales/en/ComponentStrings/UserCardStrings.js'
import { authLevel } from '../hooks/Authorization.jsx'
import { useUser } from '../../context/UserContext.jsx'

/**
 * A modal component that displays detailed user profile information and
 * provides administrative actions such as blocking or unblocking a user.
 *
 * @component
 * @param {Object} user - The user object to display in the modal.
 * @param {boolean} isOpen - Boolean flag to control modal visibility.
 * @param {Function} onClose - Callback function to execute when closing the modal.
 * @param {Function} setAlert - Callback to open alert.
 * @returns {JSX.Element} The rendered ProfileModal component.
 */
function ProfileModal({ user, isOpen, onClose, setAlert }) {
  const baseURL = import.meta.env.VITE_API_BASE_URL
  const [isBlocked, setIsBlocked] = useState(false)
  const { user: currentUser } = useUser()

  const isSelf = currentUser && Number(currentUser.id) === Number(user.id)
  const canBlock =
    !isSelf &&
    authLevel[user.role?.toUpperCase()]?.value <= authLevel.USER.value

  const checkBlockStatus = useCallback(async () => {
    try {
      const response = await fetch(`${baseURL}/api/blockStatus/${user.id}`, {
        credentials: 'include',
      })
      const data = await response.json()
      setIsBlocked(data.isBlocked)
    } catch (err) {
      console.error('Failed to fetch block status:', err)
    }
  }, [baseURL, user.id])

  useEffect(() => {
    if (isOpen && !isSelf) {
      checkBlockStatus()
    }
  }, [isOpen, isSelf, checkBlockStatus])

  const handleToggleBlock = async () => {
    const endpoint = isBlocked ? 'unblockUser' : 'blockUser'
    try {
      const response = await fetch(`${baseURL}/api/${endpoint}/${user.id}`, {
        credentials: 'include',
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        setIsBlocked(!isBlocked)
        onClose()
        setAlert?.({
          type: 'success',
          message: isBlocked
            ? userCardStrings.errors.successfulUnblock
            : userCardStrings.errors.successfulBlock,
        })
      } else {
        throw new Error(data.error)
      }
    } catch {
      // Removed 'err' since it was unused
      setAlert?.({
        type: 'error',
        message: isBlocked
          ? userCardStrings.errors.failedUnblocked
          : userCardStrings.errors.failedBlocked,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ProfileInfo
        user={user}
        actions={
          canBlock && (
            <GenericButton
              onClick={handleToggleBlock}
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
      />
    </Modal>
  )
}

ProfileModal.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    role: PropTypes.string,
    name: PropTypes.string,
    nickname: PropTypes.string,
    profile_pic: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setAlert: PropTypes.func,
}

export default ProfileModal
