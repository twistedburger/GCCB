import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import UserCard from '../components/UserCard'
import ConfirmationDialog from '../components/ConfirmationDialog'
import Alert from '../components/Alert'
import GenericButton from '../components/GenericButton'
import { useAuth } from '../hooks/Authorization'
import { ArrowBackIosNew } from '@mui/icons-material'
import {
  getIsModerator,
  getBannedUsersStrings,
  fetchUsers,
  removeUser,
} from '../utils/BannedUsersUtils'

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
  const isModerator = getIsModerator(authorization)
  const strings = getBannedUsersStrings(isModerator)
  const navigate = useNavigate()

  const handleFetchUsers = useCallback(async () => {
    try {
      const data = await fetchUsers(isModerator)
      setUsers(data)
    } catch (error) {
      console.error(strings.failedToFetch, error)
    }
  }, [isModerator, strings.failedToFetch])

  const handleRemoveUser = async userId => {
    const ok = await removeUser(userId, isModerator)
    if (ok) {
      handleFetchUsers()
      setAlert({
        message: strings.successMessage(selectedUser.name),
        type: 'success',
      })
    } else {
      setAlert({ message: strings.errorMessage, type: 'error' })
    }
  }

  useEffect(() => {
    handleFetchUsers()
  }, [handleFetchUsers])

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
            handleRemoveUser(selectedUser.id)
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
