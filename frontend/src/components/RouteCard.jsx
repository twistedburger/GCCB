import PropTypes from 'prop-types'
import CommuteIcon from './CommuteIcon.jsx'
import GenericButton from './GenericButton.jsx'
import {
  PlaceOutlined,
  OutlinedFlagRounded,
  GroupsOutlined,
  Logout,
} from '@mui/icons-material'
import { useState, useEffect } from 'react'

export default function RouteCard({ route, individualView }) {
  const dateObj = new Date(route.depart_time)
  const [peopleGoing, setPeopleGoing] = useState(Number(route.people_going))
  const [isJoined, setIsJoined] = useState(false)

  useEffect(() => {
    const checkJoined = async () => {
      const result = await fetch(
        `http://localhost:3000/api/routes/${route.id}/isJoined`,
        { credentials: 'include' }
      )
      const data = await result.json()
      setIsJoined(data.isJoined)
    }
    checkJoined()
  }, [route.id])

  const handleJoin = async () => {
    await fetch(`http://localhost:3000/api/routes/${route.id}/join`, {
      method: 'POST',
      credentials: 'include',
    })
    setIsJoined(true)
    setPeopleGoing(prev => prev + 1)
  }

  const handleLeave = async () => {
    await fetch(`http://localhost:3000/api/routes/${route.id}/leave`, {
      method: 'DELETE',
      credentials: 'include',
    })
    setIsJoined(false)
    setPeopleGoing(prev => prev - 1)
  }

  return (
    <div
      className={`flex flex-row items-center w-full rounded-xl shadow-md shadow-medium-grey bg-white p-4 ${individualView ? 'py-2' : 'py-4'}`}
    >
      <span className="shrink-0 scale-115">
        <CommuteIcon type={route.transportation_mode?.toLowerCase()} />
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
            {peopleGoing} people going{' '}
            {route.transportation_mode == 'Car' &&
              `(${route.max_ppl - peopleGoing} seats left)`}
          </p>
        </div>
      </div>
      {isJoined ? (
        <GenericButton
          unstyled
          customStyling={
            'py-1 px-4 rounded-lg font-medium bg-light-grey text-text-primary text-xs ml-2'
          }
          onClick={handleLeave}
        >
          <div className="flex flex-row items-center gap-1">
            <Logout fontSize="12px" />
            <span>Leave</span>
          </div>
        </GenericButton>
      ) : (
        <GenericButton
          unstyled
          disabled={peopleGoing >= route.max_ppl}
          customStyling={
            'py-1 px-4 rounded-lg font-medium bg-blue-primary text-white text-xs ml-2'
          }
          onClick={handleJoin}
        >
          Join
        </GenericButton>
      )}
    </div>
  )
}

RouteCard.propTypes = {
  route: PropTypes.object.isRequired,
  individualView: PropTypes.bool,
}
