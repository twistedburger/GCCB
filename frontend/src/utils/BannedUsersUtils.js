import { bannedUsersStrings } from '../locales/en/BannedUsersStrings'

export function getIsModerator(authorization) {
  return authorization === 'moderator'
}

export function getBannedUsersStrings(isModerator) {
  return isModerator ? bannedUsersStrings.moderator : bannedUsersStrings.user
}

export async function fetchUsers(isModerator) {
  const endpoint = isModerator
    ? 'http://localhost:3000/api/bannedUsers'
    : 'http://localhost:3000/api/blockedUsers'
  const response = await fetch(endpoint, { credentials: 'include' })
  return response.json()
}

export async function removeUser(userId, isModerator) {
  const endpoint = isModerator
    ? `http://localhost:3000/api/unbanUser/${userId}`
    : `http://localhost:3000/api/unblockUser/${userId}`
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
  })
  return response.ok
}
