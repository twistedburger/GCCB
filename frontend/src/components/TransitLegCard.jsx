import PropTypes from 'prop-types'
import CommuteIcon from './CommuteIcon'
import { TravelMode } from '../utils/RouteUtils'

function TransitLegCard({ name, type, distance, className }) {
  return (
    <div
      className={`flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white ${className || ''}`}
    >
      <div className="flex p-4 gap-4">
        <CommuteIcon
          type={type === TravelMode.Walk ? 'walk' : 'transit'}
          clickable={false}
        />

        <div className="border-r text-text-secondary -my-1"></div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-lg text-text-primary truncate">
              {name}
            </h3>
          </div>

          <span className="text-xs text-text-secondary mt-1">
            Distance: {distance} m
          </span>
        </div>
      </div>
    </div>
  )
}

TransitLegCard.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  distance: PropTypes.number.isRequired,
  className: PropTypes.string,
}

export default TransitLegCard
