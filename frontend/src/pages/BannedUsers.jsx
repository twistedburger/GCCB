import { bannedUsersStrings } from '../locales/en/BannedUsersStrings'
import { useEffect, useState } from 'react'
import OrganizerCard from '../components/OrganizerCard'
import ConfirmationDialog from '../components/ConfirmationDialog'

/**
 * Creates the Banned Users page.
 *
 * @returns {JSX.Element}
 */
function BannedUsers() {
  const [bannedUsers, setBannedUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [openModal, setOpenModal] = useState(false)

  const fetchedBannedUsers = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/bannedUsers`, {
        credentials: 'include',
      })
      const data = await response.json()
      setBannedUsers(data)
    } catch (error) {
      console.error('Failed to fetch banned users:', error)
    }
  }

  useEffect(() => {
    fetchedBannedUsers()
  }, [])

  return (
    <div className="px-6 pt-6">
      <div className="*:ml-13.75">
        <ConfirmationDialog
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          title={bannedUsersStrings.confirmTitle}
          onConfirm={() => {
            console.log(
              `Some call that allows ${selectedUser?.name} to log in again after being banned :P`
            )
            setOpenModal(false)
            fetchedBannedUsers()
          }}
          variant={'danger'}
        >
          {bannedUsersStrings.areYouSure}
        </ConfirmationDialog>
      </div>
      <p className="text-2xl text-text-primary font-medium pb-4">
        {bannedUsersStrings.title}
      </p>
      {bannedUsers.map(user => (
        <OrganizerCard
          key={user.id}
          user={user}
          primaryActionLabel={bannedUsersStrings.unbanButton}
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
