export const bannedUsersStrings = {
  moderator: {
    title: 'Banned Users',
    actionButton: 'Unban',
    areYouSure:
      'Are you sure you want to unban this user? This action cannot be undone.',
    confirmTitle: 'Confirm Unban',
    successMessage: name => `${name} has been unbanned successfully.`,
    errorMessage: 'Failed to unban user.',
    failedToFetch: 'Failed to fetch banned users.',
  },
  user: {
    title: 'Blocked Users',
    actionButton: 'Unblock',
    areYouSure: 'Are you sure you want to unblock this user?',
    confirmTitle: 'Confirm Unblock',
    successMessage: name => `${name} has been unblocked successfully.`,
    errorMessage: 'Failed to unblock user.',
    failedToFetch: 'Failed to fetch blocked users.',
  },
}
