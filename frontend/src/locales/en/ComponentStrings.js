export const componentStrings = {
  badgesBlock: {
    noBadges: 'No badges earned yet.',
  },
  createEvent: {
    eventNameRequired: 'Event name is required',
    locationRequired: 'Location is required',
    dateRequired: 'Date & time is required',
    creationSuccess: 'Event and routes created successfully!',
    creationFailed: 'Failed to create event.',
    createEventTitle: 'Create a New Event',
    confirmCreationTitle: 'Confirm Event Creation',
    confirmCreationMessage: (eventName, routeCount) =>
      `Are you sure you want to create "${eventName}" with ${routeCount} route(s)?`,
    nameLabel: 'Event Name',
    locationLabel: 'Location',
    eventLocationPlaceholder: 'Enter event location',
    dateLabel: 'Event Date & Time',
    descriptionLabel: 'Event Description',
    addedRoutesTitle: 'Added Routes',
    addRoute: 'Add a Route',
    createEvent: 'Create Event',
  },
}
