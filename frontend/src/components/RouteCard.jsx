import PropTypes from 'prop-types'
import CommuteIcon from './CommuteIcon.jsx'
import GenericButton from './GenericButton.jsx'
import {
  PlaceOutlined,
  OutlinedFlagRounded,
  GroupsOutlined,
  Logout,
  DateRangeRounded,
} from '@mui/icons-material'
import { useState, useEffect } from 'react'

export default function RouteCard({
  route,
  view,
  isDraft = false,
  individualView,
  isCompleted = false,
  routeDetailView = false,
  onSelect,
  onToggleJoin,
  onReport,
}) {
  const dateObj = new Date(route.depart_time)
  const [peopleGoing, setPeopleGoing] = useState(0)
  const [isJoined, setIsJoined] = useState(false)
  const isFull =
    route.transportation_mode === 'car' && peopleGoing >= route.max_ppl
  const activeJoinedState = isDraft ? route.isJoined : isJoined

  useEffect(() => {
    setPeopleGoing(parseInt(route.people_going, 10) || 0)
  }, [route.people_going])

  useEffect(() => {
    if (isDraft) return

    const checkJoined = async () => {
      const result = await fetch(
        `http://localhost:3000/api/routes/${route.id}/isJoined`,
        { credentials: 'include' }
      )
      const data = await result.json()
      setIsJoined(data.isJoined)
    }
    checkJoined()
  }, [route.id, isDraft])

  const handleJoin = async e => {
    e.stopPropagation()
    if (isDraft) {
      onToggleJoin(route.id)
      setPeopleGoing(prev => prev + 1)
      return
    }

    await fetch(`http://localhost:3000/api/routes/${route.id}/join`, {
      method: 'POST',
      credentials: 'include',
    })
    setIsJoined(true)
    setPeopleGoing(prev => prev + 1)
  }

  const handleLeave = async e => {
    e.stopPropagation()
    if (isDraft) {
      onToggleJoin(route.id)
      setPeopleGoing(prev => prev - 1)
      return
    }

    await fetch(`http://localhost:3000/api/routes/${route.id}/leave`, {
      method: 'DELETE',
      credentials: 'include',
    })
    setIsJoined(false)
    setPeopleGoing(prev => prev - 1)
  }
  return (
    <div className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white overflow-hidden">
      <div
        className={`flex flex-row items-center p-4 justify-between ${individualView ? 'py-2' : 'py-4'} ${onSelect ? 'cursor-pointer' : ''}`}
        onClick={() => {
          if (onSelect) onSelect(route)
        }}
      >
        <div className="flex flex-row">
          <span className="shrink-0 scale-115 flex items-center">
            <CommuteIcon type={route.transportation_mode?.toLowerCase()} />
          </span>
          <div className="flex flex-col ml-4 text-left">
            {individualView && (
              <span className="text-text-primary font-medium mb-1">
                {route.title || route.route_name || route.name}
              </span>
            )}
            <div className="flex flex-row text-text-secondary text-xs items-center leading-none">
              <PlaceOutlined className="mr-1 -ml-1" fontSize="small" />
              <p>
                {route.origin || route.start_point}{' '}
                {!routeDetailView &&
                  route.depart_time &&
                  !isCompleted &&
                  `@ ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
              </p>
            </div>
            {(individualView || routeDetailView) && (
              <div className="flex flex-row text-text-secondary text-xs items-center leading-none">
                <OutlinedFlagRounded className="mr-1 -ml-1" fontSize="small" />
                <p>{route.destination || route.end_point}</p>
              </div>
            )}
            {((routeDetailView && route.depart_time) ||
              (onToggleJoin && !isDraft && route.depart_time)) && (
              <div className="flex flex-row text-text-secondary text-xs items-center leading-none">
                <DateRangeRounded className="mr-1 -ml-1" fontSize="small" />
                <p>{`${dateObj.toLocaleDateString('en-US', { month: 'long' })} ${dateObj.getDate()} @ ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>
              </div>
            )}
            <div className="flex flex-row text-text-secondary text-xs items-center leading-none">
              <GroupsOutlined className="mr-1 -ml-1" fontSize="small" />
              <p>
                {peopleGoing} people going{' '}
                {route.transportation_mode === 'car' &&
                  route.max_ppl &&
                  `(${route.max_ppl - peopleGoing} seats left)`}
              </p>
            </div>
            {isCompleted && route.event_time && (
              <div className="flex flex-row text-text-secondary text-xs items-center leading-none -ml-1 pt-1">
                <b>Completed:&nbsp;</b>
                {new Date(route.event_time).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                {new Date(route.event_time).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </div>
            )}
          </div>
        </div>

        {view !== 'moderator' && (
          <div className="flex flex-col gap-1">
            {((!isDraft && onToggleJoin) || !individualView) && (
              <GenericButton
                unstyled
                customStyling="py-1 px-4 rounded-lg font-medium bg-light-grey text-text-primary text-xs ml-2"
                onClick={e => {
                  e.stopPropagation()
                  if (onReport) {
                    onReport({
                      type: 'route',
                      targetId: route.id,
                      title: route.title || route.route_name || '',
                    })
                  }
                }}
              >
                <span>Report</span>
              </GenericButton>
            )}
            {!isCompleted &&
              (activeJoinedState ? (
                <GenericButton
                  unstyled
                  customStyling="py-1 px-4 rounded-lg font-medium bg-light-grey text-text-primary text-xs ml-2"
                  onClick={e => {
                    e.stopPropagation()
                    if (onToggleJoin && !isDraft) {
                      onToggleJoin()
                    } else {
                      handleLeave(e)
                    }
                  }}
                >
                  <div className="flex flex-row items-center gap-1">
                    <Logout fontSize="12px" />
                    <span>Leave</span>
                  </div>
                </GenericButton>
              ) : (
                <GenericButton
                  unstyled
                  disabled={isFull}
                  customStyling={`py-1 px-4 rounded-lg font-medium bg-blue-primary text-white text-xs ml-2 ${isFull ? 'opacity-50' : ''}`}
                  onClick={handleJoin}
                >
                  Join
                </GenericButton>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

RouteCard.propTypes = {
  route: PropTypes.object.isRequired,
  view: PropTypes.string,
  isDraft: PropTypes.bool,
  individualView: PropTypes.bool,
  isCompleted: PropTypes.bool,
  onSelect: PropTypes.func,
  onToggleJoin: PropTypes.func,
  onReport: PropTypes.func,
  routeDetailView: PropTypes.bool,
}
