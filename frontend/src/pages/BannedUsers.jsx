import { bannedUsersStrings } from '../locales/en/BannedUsersStrings'
import { useEffect, useState, useCallback } from 'react'
import OrganizerCard from '../components/OrganizerCard'
import ConfirmationDialog from '../components/ConfirmationDialog'
import Alert from '../components/Alert'
import { useAuth } from '../hooks/Authorization'

/**
 * Creates the Banned Users page.
 *
 * @returns {JSX.Element}
 */
function BannedUsers() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [alert, setAlert] = useState(null)
  const { authorization } = useAuth()
  const isModerator = authorization === 'moderator'
  const strings = isModerator
    ? bannedUsersStrings.moderator
    : bannedUsersStrings.user

  const fetchUsers = useCallback(async () => {
    try {
      const endpoint = isModerator
        ? 'http://localhost:3000/api/bannedUsers'
        : 'http://localhost:3000/api/blockedUsers'
      const response = await fetch(endpoint, { credentials: 'include' })
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error(strings.failedToFetch, error)
    }
  }, [isModerator, strings.failedToFetch])

  const removeUser = async userId => {
    try {
      const endpoint = isModerator
        ? `http://localhost:3000/api/unbanUser/${userId}`
        : `http://localhost:3000/api/unblockUser/${userId}`
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        fetchUsers()
        setAlert({
          message: strings.successMessage(selectedUser.name),
          type: 'success',
        })
      }
    } catch (error) {
      console.error(strings.errorMessage, error)
      setAlert({
        message: strings.errorMessage,
        type: 'error',
      })
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div className="px-6 pt-6">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onTimeout={() => setAlert(null)}
        />
      )}
      <div className="*:ml-13.75">
        <ConfirmationDialog
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          title={strings.confirmTitle}
          onConfirm={() => {
            removeUser(selectedUser.id)
            setOpenModal(false)
          }}
          variant={'danger'}
        >
          {strings.areYouSure}
        </ConfirmationDialog>
      </div>
      <p className="text-2xl text-text-primary font-medium pb-4">
        {strings.title}
      </p>
      {users.map(user => (
        <OrganizerCard
          key={user.id}
          user={user}
          primaryActionLabel={strings.actionButton}
          onPrimaryAction={() => {
            setSelectedUser(user)
            setOpenModal(true)
          }}
          primaryButtonStyling={
            'text-xs font-medium text-red-500 border border-red-500 rounded-2xl px-4 py-1'
          }
        />
      ))}
    </div>
  )
}

export default BannedUsers
