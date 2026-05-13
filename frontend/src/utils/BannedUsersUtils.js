import { bannedUsersStrings } from '../locales/en/BannedUsersStrings'

const baseUrl = import.meta.env.VITE_API_BASE_URL

/**
 * Returns the localized strings for the banned users view based on the user's role.
 * @param {boolean} isModerator - Whether the current user has moderator privileges.
 * @returns {object} The specific strings for moderators or standard users.
 */
export function getBannedUsersStrings(isModerator) {
  return isModerator ? bannedUsersStrings.moderator : bannedUsersStrings.user
}

/**
 * Fetches the list of banned or blocked users.
 * @param {boolean} isModerator - Whether to fetch the moderator-level banned list or the user-level blocked list.
 * @returns {Promise<Array>} A promise that resolves to the list of users.
 */
export async function fetchUsers(isModerator) {
  const endpoint = isModerator
    ? `${baseUrl}/api/bannedUsers`
    : `${baseUrl}/api/blockedUsers`
  const response = await fetch(endpoint, { credentials: 'include' })
  return response.json()
}

/**
 * Removes a user from the banned or blocked list.
 * @param {number} userId - The unique identifier of the user to remove.
 * @param {boolean} isModerator - Whether the action is being performed by a moderator or user. Unbans if
 * the user is a moderator, unblocks if the user is a user.
 * @returns {Promise<boolean>} A promise that resolves to true if the operation was successful.
 */
export async function removeUser(userId, isModerator) {
  const endpoint = isModerator
    ? `${baseUrl}/api/unbanUser/${userId}`
    : `${baseUrl}/api/unblockUser/${userId}`
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
  })
  return response.ok
}
