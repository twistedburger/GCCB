import PropTypes from 'prop-types'

export default function EventCard({ event }) {
  return <div>{event.title}</div>
}

EventCard.propTypes = { event: PropTypes.object.isRequired }
