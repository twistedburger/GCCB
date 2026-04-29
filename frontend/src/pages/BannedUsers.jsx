import { bannedUsersStrings } from '../locales/en/BannedUsersStrings'

/**
 * Creates the Banned Users page.
 *
 * @returns {JSX.Element}
 */
function BannedUsers() {
  return (
    <div className="px-6 pt-6">
      <p className="text-2xl text-text-primary font-medium">
        {bannedUsersStrings.title}
      </p>
    </div>
  )
}

export default BannedUsers
