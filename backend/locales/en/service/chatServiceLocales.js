const chatServiceStrings = {
  intervals: {
    deletionBuffer: '2 days',
  },
  errors: {
    cleanup: 'Failed to perform chat room cleanup',
    fetchRooms: 'Failed to fetch chat rooms for this user',
    roomDetails: 'Failed to load full chat room details',
    membership: 'Error verifying chat membership',
    addUser: 'Failed to add user to the chat room',
    removeUser: 'Failed to remove user from the chat room',
    createRoom: 'Failed to create a new chat room',
    deleteRoom: 'Failed to delete the chat room',
    saveMessage: 'Failed to save the chat message',
  },
}

module.exports = { chatServiceStrings }
