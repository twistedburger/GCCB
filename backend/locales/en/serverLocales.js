const serverStrings = {
  errors: {
    generic: 'Oops, something went wrong',
    accessDenied: 'Access Denied',
    userExists: 'User already exists',
    noUser: 'No logged in user',
    inactiveUser:
      'Your account has been inactive for a while. Please contact support to reactivate your account.',
    google: 'Could not fetch from google maps api',
    noPhotos: 'No photos found for this place',
    internal: 'Internal Server Error',
    eventCreationFailed: 'Failed to create event',
    routeCreationFailed: 'Failed to create and link route',
    eventFetchFailed: 'Failed to fetch event detail',
    joinStatusFailed: 'Failed to check join status',
    joinFailed: 'Failed to join route',
    leaveFailed: 'Failed to leave route',
    duplicateReport: 'You have already reported this content.',
    reportFailed: 'Failed to submit report',
    notAuthenticated: 'Not authenticated',
    analyticsUserOnly: 'Only regular users can access commute history.',
    routeDeletionFailed: 'Failed to delete route',
    routeCompletionFailed: 'Failed to mark route as complete',
    notMember: 'Not a member of this chatroom',
  },
}

module.exports = { serverStrings }
