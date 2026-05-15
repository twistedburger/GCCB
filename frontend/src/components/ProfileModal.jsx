import PropTypes from 'prop-types'
import { useState, useEffect, useCallback } from 'react'
import Modal from './Modal'
import ProfileInfo from './ProfileInfo'
import GenericButton from './GenericButton.jsx'
import { profileModalStrings } from '../locales/en/ComponentStrings/ProfileModalStrings.js'
import { authLevel } from '../hooks/Authorization.jsx'
import { useUser } from '../../context/UserContext.jsx'
import BadgeCard from './BadgeCard.jsx'

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
  const [recentBadges, setRecentBadges] = useState([])
  const { user: currentUser } = useUser()

  const isSelf = currentUser && Number(currentUser.id) === Number(user.id)
  const canBlock =
    !isSelf &&
    authLevel[user.role?.toUpperCase()]?.value <= authLevel.USER.value

  async function fetchRecentBadges() {
    try {
      const res = await fetch(`${baseURL}/api/badges/${user.id}`, {
        credentials: 'include',
      })

      if (!res.ok) return
      const data = await res.json()

      const earned = (data.badges ?? [])
        .filter(badge => badge.earned)
        .sort(
          (badgeA, badgeB) =>
            new Date(badgeB.dateEarned) - new Date(badgeA.dateEarned)
        )
        .slice(0, 3)

      setRecentBadges(earned)
    } catch (err) {
      console.error('Failed to load recent badges', err)
    }
  }

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchRecentBadges()
    }
  }, [isOpen, user?.id])

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
            ? profileModalStrings.errors.successfulUnblock
            : profileModalStrings.errors.successfulBlock,
        })
      } else {
        throw new Error(data.error)
      }
    } catch {
      setAlert?.({
        type: 'error',
        message: isBlocked
          ? profileModalStrings.errors.failedUnblocked
          : profileModalStrings.errors.failedBlocked,
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
              {isBlocked
                ? profileModalStrings.unblock
                : profileModalStrings.block}
            </GenericButton>
          )
        }
      />
      <div className="pt-4">
        <h4 className="text-xs font-bold text-text-primary mb-2">
          {profileModalStrings.recentBadges}
        </h4>

        {recentBadges.length > 0 ? (
          <div className="flex flex-row gap-3">
            {recentBadges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} showLocked={true} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-secondary italic">
            {profileModalStrings.noBadges}
          </p>
        )}
      </div>
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
