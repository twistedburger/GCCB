const NotificationType = Object.freeze({
  Event: { idType: 'event_id', type: 'event' },
  Route: { idType: 'route_id', type: 'route' },
  Badge: { idType: 'badge_id', type: 'badge' },
  Message: { idType: 'message_id', type: 'message' },
})

export { NotificationType }

if (typeof module !== 'undefined') module.exports = { NotificationType }
