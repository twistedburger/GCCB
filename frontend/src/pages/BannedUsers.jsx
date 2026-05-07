import { bannedUsersStrings } from '../locales/en/BannedUsersStrings'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import UserCard from '../components/UserCard'
import ConfirmationDialog from '../components/ConfirmationDialog'
import Alert from '../components/Alert'
import GenericButton from '../components/GenericButton'
import { useAuth } from '../hooks/Authorization'
import { ArrowBackIosNew } from '@mui/icons-material'

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
  const navigate = useNavigate()
  const strings =
    authorization === 'moderator'
      ? bannedUsersStrings.moderator
      : bannedUsersStrings.user

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/bannedUsers`, {
        credentials: 'include',
      })
      const bannedUsers = await response.json()
      setUsers(bannedUsers)
    } catch (error) {
      console.error(strings.failedToFetch, error)
    }
  }, [strings.failedToFetch])

  const unbanUser = async userId => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/unbanUser/${userId}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )
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
            unbanUser(selectedUser.id)
            setOpenModal(false)
          }}
          variant={'danger'}
        >
          {strings.areYouSure}
        </ConfirmationDialog>
      </div>
      <div className="flex flex-row items-center pb-4 gap-2">
        <GenericButton
          unstyled
          onClick={() => {
            navigate(-1)
          }}
        >
          <ArrowBackIosNew />
        </GenericButton>
        <p className="text-2xl text-text-primary font-medium">
          {strings.title}
        </p>
      </div>
      {users.map(user => (
        <UserCard
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
