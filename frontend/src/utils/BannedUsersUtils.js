import { bannedUsersStrings } from '../locales/en/BannedUsersStrings'

const baseURL = import.meta.env.VITE_API_BASE_URL

export function getIsModerator(authorization) {
  return authorization === 'moderator'
}

export function getBannedUsersStrings(isModerator) {
  return isModerator ? bannedUsersStrings.moderator : bannedUsersStrings.user
}

export async function fetchUsers(isModerator) {
  const endpoint = isModerator
    ? `${baseURL}/api/bannedUsers`
    : `${baseURL}/api/blockedUsers`
  const response = await fetch(endpoint, { credentials: 'include' })
  return response.json()
}

export async function removeUser(userId, isModerator) {
  const endpoint = isModerator
    ? `${baseURL}/api/unbanUser/${userId}`
    : `${baseURL}/api/unblockUser/${userId}`
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
  })
  return response.ok
}
