import PropTypes from 'prop-types'
import CommuteIcon from './CommuteIcon.jsx'
import GenericButton from './GenericButton.jsx'
import {
  PlaceOutlined,
  OutlinedFlagRounded,
  GroupsOutlined,
  Logout,
  DateRangeRounded,
  ChatOutlined,
} from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { routeCardStrings as routeStrings } from '../locales/en/ComponentStrings/RouteCardStrings.js'

// TODO: standardize transportation mode naming

/**
 * A card component for displaying route information and actions.
 *
 * @param {Object} route - The route data to display.
 * @param {boolean} [hideReportJoin=false] - Flag to hide the report and join buttons.
 * @param {boolean} [isDraft=false] - Flag indicating if the route is a draft from a form.
 * @param {boolean} [individualView] - Flag indicating if the card is displayed in individual view mode.
 * @param {Function} [onOpenChat] - Callback to open the chat room for this route.
 * @returns {JSX.Element}
 */

export default function RouteCard({
  route,
  hideReportJoin = false,
  isDraft = false,
  individualView,
  isCompleted = false,
  routeDetailView = false,
  onSelect,
  isDisabled = false,
  onToggleJoin,
  onReport,
  onOpenChat,
}) {
  const routeCardStrings = routeStrings.routeCard
  const dateObj = new Date(route.depart_time)
  const [peopleGoing, setPeopleGoing] = useState(0)
  const [isJoined, setIsJoined] = useState(false)
  const isFull =
    (route.transportation_mode === 'Car' ||
      route.transportationMode === 'Car') &&
    peopleGoing >= route.max_ppl
  const activeJoinedState = isDraft ? route.isJoined : isJoined
  const baseURL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    setPeopleGoing(parseInt(route.people_going, 10) || 0)
  }, [route.people_going])

  useEffect(() => {
    if (isDraft) return

    const checkJoined = async () => {
      const result = await fetch(`${baseURL}/api/routes/${route.id}/isJoined`, {
        credentials: 'include',
      })
      const data = await result.json()
      setIsJoined(data.isJoined)
    }
    checkJoined()
  }, [route.id, isDraft]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isDraft || route.isJoined === undefined) return
    setIsJoined(route.isJoined)
  }, [route.isJoined, isDraft])

  const handleJoin = async e => {
    e.stopPropagation()
    if (isDraft) {
      onToggleJoin(route.id)
      setPeopleGoing(prev => prev + 1)
      return
    }

    await fetch(`${baseURL}/api/routes/${route.id}/join`, {
      method: 'POST',
      credentials: 'include',
    })
    setIsJoined(true)
    setPeopleGoing(prev => prev + 1)
    if (onToggleJoin) onToggleJoin(route)
  }

  const handleLeave = async e => {
    e.stopPropagation()
    if (isDraft) {
      onToggleJoin(route.id)
      setPeopleGoing(prev => prev - 1)
      return
    }

    await fetch(`${baseURL}/api/routes/${route.id}/leave`, {
      method: 'DELETE',
      credentials: 'include',
    })
    setIsJoined(false)
    setPeopleGoing(prev => prev - 1)
  }

  const handleClick = async e => {
    e.stopPropagation()
    if (isDraft) {
      handleLeave(e)
      return
    }
    if (onToggleJoin) {
      onToggleJoin(route)
    } else {
      handleLeave(e)
    }
  }

  return (
    <div
      data-testid={`route-card-${route.id}`}
      className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white"
    >
      <div
        className={`flex flex-row items-center p-4 justify-between ${individualView ? 'py-2' : 'py-4'} ${onSelect ? 'cursor-pointer' : ''}`}
        onClick={() => {
          if (onSelect) onSelect(route)
        }}
      >
        <div className="flex flex-row">
          <span className="shrink-0 scale-115 flex items-center">
            <CommuteIcon
              type={
                route.transportation_mode?.toLowerCase() ||
                route.transportationMode?.toLowerCase()
              }
            />
          </span>
          <div className="flex flex-col ml-4 text-left">
            {individualView && (
              <div className="flex flex-row items-center gap-1.5 mb-1">
                <span className="text-text-primary font-medium">
                  {route.title || route.route_name || route.name}
                </span>
              </div>
            )}
            <div className="flex flex-row text-text-secondary text-xs items-center leading-none">
              <PlaceOutlined className="mr-1 -ml-1" fontSize="small" />
              <p>
                {route.origin || route.start_point}{' '}
                {!routeDetailView &&
                  route.depart_time &&
                  !isCompleted &&
                  `${routeCardStrings.at} ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
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
                <p>{`${dateObj.toLocaleDateString('en-US', { month: 'long' })} ${dateObj.getDate()} ${routeCardStrings.at} ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>
              </div>
            )}
            <div className="flex flex-row text-text-secondary text-xs items-center leading-none">
              <GroupsOutlined className="mr-1 -ml-1" fontSize="small" />
              <p>
                {routeCardStrings.peopleGoing(peopleGoing)}{' '}
                {(route.transportation_mode === 'Car' ||
                  route.transportationMode === 'Car') &&
                  route.max_ppl &&
                  routeCardStrings.seatsLeft(route.max_ppl - peopleGoing)}
              </p>
            </div>
            {isCompleted && route.event_time && (
              <div className="flex flex-row text-text-secondary text-xs items-center leading-none -ml-1 pt-1">
                <b>{routeCardStrings.completed}&nbsp;</b>
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

        {!hideReportJoin && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-center m-2">
              {onOpenChat && (
                <GenericButton
                  unstyled
                  onClick={e => {
                    e.stopPropagation()
                    onOpenChat()
                  }}
                  customStyling="flex border border-1 items-center justify-center w-10 h-10 rounded-full text-blue-primary bg-blue-secondary hover:opacity-80 transition-opacity"
                  aria-label="Open chat for this route"
                >
                  <ChatOutlined style={{ fontSize: 25 }} />
                </GenericButton>
              )}
            </div>
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
                <span>{routeStrings.common.report}</span>
              </GenericButton>
            )}
            {!isCompleted &&
              !isDisabled &&
              (activeJoinedState ? (
                <GenericButton
                  unstyled
                  customStyling="py-1 px-4 rounded-lg font-medium bg-light-grey text-text-primary text-xs ml-2"
                  onClick={handleClick}
                >
                  <div className="flex flex-row items-center gap-1">
                    <Logout fontSize="12px" />
                    <span>{routeCardStrings.leave}</span>
                  </div>
                </GenericButton>
              ) : (
                <GenericButton
                  unstyled
                  disabled={isFull}
                  customStyling={`py-1 px-4 rounded-lg font-medium bg-blue-primary text-white text-xs ml-2 ${isFull ? 'opacity-50' : ''}`}
                  onClick={handleJoin}
                >
                  {routeCardStrings.join}
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
  hideReportJoin: PropTypes.string,
  isDraft: PropTypes.bool,
  individualView: PropTypes.bool,
  isCompleted: PropTypes.bool,
  onSelect: PropTypes.func,
  onToggleJoin: PropTypes.func,
  onReport: PropTypes.func,
  isDisabled: PropTypes.bool,
  routeDetailView: PropTypes.bool,
  onOpenChat: PropTypes.func,
}
