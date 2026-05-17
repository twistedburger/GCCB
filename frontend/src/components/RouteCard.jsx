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
  const peopleGoing = parseInt(route.people_going, 10) || 0
  const isJoined = !!route.isJoined
  const activeJoinedState = isJoined
  const isFull =
    (route.transportation_mode === 'Car' ||
      route.transportationMode === 'Car') &&
    peopleGoing >= route.max_ppl

  const isChatVisible = Date.now() < dateObj.getTime() + 2 * 24 * 60 * 60 * 1000

  const handleJoin = event => {
    event.stopPropagation()
    if (onToggleJoin) onToggleJoin(route)
  }

  const handleClick = async event => {
    event.stopPropagation()
    if (onToggleJoin) onToggleJoin(route)
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
              <p>{route.origin || route.start_point}</p>
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
        <div className="flex flex-col items-center gap-2">
          <div className={`w-10 h-10 ${hideReportJoin ? 'mr-5' : ''}`}>
            {onOpenChat && isChatVisible && (
              <GenericButton
                unstyled
                onClick={event => {
                  event.stopPropagation()
                  onOpenChat()
                }}
                customStyling="flex border border-1 items-center justify-center w-10 h-10 rounded-full text-blue-primary bg-blue-secondary hover:scale-110 active:scale-100 cursor-pointer transition-opacity"
              >
                <ChatOutlined style={{ fontSize: 25 }} />
              </GenericButton>
            )}
          </div>
          {!hideReportJoin && (
            <div className="flex flex-col gap-1 items-center">
              {!isDraft && onToggleJoin && onReport && (
                <GenericButton
                  unstyled
                  customStyling="cursor-pointer w-full py-1 px-4 rounded-lg font-medium bg-light-grey text-text-primary text-xs text-center"
                  onClick={event => {
                    event.stopPropagation()
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
                    customStyling="cursor-pointer w-full py-1 px-4 rounded-lg font-medium bg-light-grey text-text-primary text-xs text-center"
                    onClick={handleClick}
                  >
                    <div className="flex flex-row items-center justify-center gap-1">
                      <Logout fontSize="12px" />
                      <span>{routeCardStrings.leave}</span>
                    </div>
                  </GenericButton>
                ) : (
                  <GenericButton
                    unstyled
                    disabled={isFull}
                    customStyling={`w-full py-1 px-4 rounded-lg font-medium bg-blue-primary text-white text-xs text-center ${isFull ? 'opacity-50' : ''}`}
                    onClick={handleJoin}
                  >
                    {routeCardStrings.join}
                  </GenericButton>
                ))}
            </div>
          )}
        </div>
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
