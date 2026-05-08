const NotificationType = Object.freeze({
  Event: { key: 'Event', idType: 'event_id', type: 'event' },
  Route: { key: 'Route', idType: 'route_id', type: 'route' },
  Badge: { key: 'Badge', idType: 'badge_id', type: 'badge' },
  Message: { key: 'Message', idType: 'message_id', type: 'message' },
})

export { NotificationType }

if (typeof module !== 'undefined') module.exports = { NotificationType }
