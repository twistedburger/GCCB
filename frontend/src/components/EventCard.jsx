import PropTypes from 'prop-types'
import bcitCover from '../assets/bcit.jpg'
import {
  OutlinedFlagRounded,
  VerifiedOutlined,
  ReportGmailerrorred,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

/**
 * Component to display an event card.
 *
 * @param {Object} event - The event data.
 * @param {boolean} [hideReport=false] - Whether to hide the report button.
 * @param {Function} [onReport] - The function to call when an event is reported.
 * @returns {JSX.Element}
 */

export default function EventCard({ event, hideReport = false, onReport }) {
  const dateObj = new Date(event.event_time)
  const navigate = useNavigate()

  return (
    <div
      onClick={() => {
        navigate(`/event/${event.id}`)
      }}
      className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white"
    >
      <div className="relative">
        <img
          src={event.banner_url || bcitCover}
          className="h-24 w-full object-cover rounded-t-xl"
        />
        {!hideReport && (
          <ReportGmailerrorred
            className="absolute top-2 right-2"
            onClick={e => {
              e.stopPropagation()
              onReport({ id: event.id, title: event.title, type: 'event' })
            }}
          />
        )}
      </div>
      <div className="flex p-4 gap-4">
        <div className="flex flex-col justify-center text-center px-2 shrink-0">
          <span className="text-dark-grey font-medium">
            {dateObj && !isNaN(dateObj)
              ? dateObj
                  .toLocaleDateString('en-US', { month: 'short' })
                  .toUpperCase()
              : '—'}
          </span>
          <span className="text-2xl text-text-primary font-bold -mt-1">
            {dateObj && !isNaN(dateObj) ? dateObj.getDate() : '—'}
          </span>
          <span className="text-xs text-text-secondary mt-1 whitespace-nowrap">
            {dateObj.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        </div>
        <div className="border-r text-text-secondary -my-1"></div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="text-text-secondary flex text-xs items-center gap-1 min-w-0">
            <OutlinedFlagRounded fontSize="small" className="shrink-0" />
            <p className="truncate">{event.location}</p>
          </div>
          <div className="flex flex-row items-center">
            <h3 className="font-semibold text-lg text-text-primary mr-1">
              {event.title}
            </h3>
            {event.verified && <VerifiedOutlined fontSize="small" />}
          </div>
          <span className="text-xs text-text-secondary mt-1">
            {event.description}
          </span>
        </div>
      </div>
    </div>
  )
}

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
  hideReport: PropTypes.bool,
  onReport: PropTypes.func.isRequired,
}
