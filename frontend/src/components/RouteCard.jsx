import PropTypes from 'prop-types'
import CommuteIcon from './CommuteIcon.jsx'
import {
  PlaceOutlined,
  OutlinedFlagRounded,
  GroupsOutlined,
} from '@mui/icons-material'

export default function RouteCard({ route, individualView }) {
  const dateObj = new Date(route.depart_time)
  const transportationMap = {
    Bicycle: 'bike',
    Car: 'car',
    Walk: 'walk',
    Transit: 'bus',
  }

  return (
    <div
      className={`flex flex-row items-center w-full rounded-xl shadow-md shadow-medium-grey bg-white p-4 ${individualView ? 'py-2' : 'py-4'}`}
    >
      <span className="shrink-0 scale-115">
        <CommuteIcon type={transportationMap[route.transportation_mode]} />
      </span>
      <div className="flex flex-col ml-4">
        {individualView && (
          <span className="text-text-primary font-medium mb-1">
            {route.title}
          </span>
        )}
        <div className="flex flex-row text-text-secondary text-xs items-center leading-none">
          <PlaceOutlined className="mr-1 -ml-1" fontSize="small" />
          <p>{`${route.origin} @ ${dateObj.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}`}</p>
        </div>
        {individualView && (
          <div className="flex flex-row text-text-secondary text-xs items-center leading-none">
            <OutlinedFlagRounded className="mr-1 -ml-1" fontSize="small" />
            <p>{route.destination}</p>
          </div>
        )}
        <div className="flex flex-row text-text-secondary text-xs items-center leading-none">
          <GroupsOutlined className="mr-1 -ml-1" fontSize="small" />
          <p>
            {route.people_going} people going{' '}
            {route.transportation_mode == 'Car' &&
              `(${route.max_ppl - route.people_going} seats left)`}
          </p>
        </div>
      </div>
    </div>
  )
}

RouteCard.propTypes = {
  route: PropTypes.object.isRequired,
  individualView: PropTypes.bool,
}
