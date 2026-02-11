import PropTypes from 'prop-types'
import bcitCover from '../assets/bcit.jpg'
import OutlinedFlagRounded from '@mui/icons-material/OutlinedFlagRounded'
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined'

export default function EventCard({ event }) {
  const dateObj = new Date(event.event_time)
  return (
    <div className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white">
      <img src={bcitCover} className="h-24 w-full object-cover rounded-t-xl" />
      <div className="flex p-4 gap-4">
        <div className="flex flex-col justify-center text-center px-2 shrink-0">
          <span className="text-dark-grey font-medium">
            {dateObj
              .toLocaleDateString('en-US', { month: 'short' })
              .toUpperCase()}
          </span>
          <span className="text-2xl text-text-primary font-bold -mt-1">
            {dateObj.getDate()}
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
            <h3 className="font-semibold text-xl text-text-primary mr-1">
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

EventCard.propTypes = { event: PropTypes.object.isRequired }
