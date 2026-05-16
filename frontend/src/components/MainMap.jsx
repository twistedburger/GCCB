import PropTypes from 'prop-types'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps'
import MapController from './MapController'
import { useState } from 'react'
import GenericButton from './GenericButton'
import { useNavigate } from 'react-router-dom'
import {
  Close,
  DateRangeRounded,
  East,
  PlaceOutlined,
  OutlinedFlagRounded,
} from '@mui/icons-material'
import { RadiusCircle } from '../utils/MainMapUtils'
import { mainMapStrings } from '../locales/en/ComponentStrings/MainMapStrings'

/**
 * Component to display the main map.
 *
 * @param {React.ReactNode} children - The child nodes to render inside the map.
 * @param {Object} defaultCenter - The default center position for the map.
 * @param {Object} route - The route information for the map.
 * @param {Function} onLoad - The function to call when the map is loaded.
 * @param {Function} onUnmount - The function to call when the map is unmounted.
 * @param {Array} events - The events to map as markers on the map.
 * @param {Function} onMapClick - The function to call when the map is clicked.
 * @param {Number} searchRadius - The radius of the current search to draw a circle.
 * @returns {JSX.Element}
 */

export default function MainMap({
  children,
  defaultCenter,
  route,
  onLoad,
  onUnmount,
  mapKey,
  events,
  onMapClick,
  onCenterChanged,
  onRouteClick,
  searchRadius = 2000,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const navigate = useNavigate()

  const isDeparting = route?.path?.departing
  const showOrigin = isDeparting && route?.path?.origin
  const showDestination = !isDeparting && route?.path?.destination

  return (
    <APIProvider
      apiKey=""
      scriptUrl={`${import.meta.env.VITE_API_BASE_URL}/maps/api/js`}
      libraries={['geometry']}
    >
      <Map
        mapId="6621f78cbdb1902f92a3d543"
        className="absolute w-full h-full"
        key={mapKey}
        defaultCenter={defaultCenter}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI={true}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={mapClick => {
          setSelectedEvent(null)
          setSelectedRoute(null)
          if (onMapClick) {
            const { lat, lng } = mapClick.detail.latLng
            onMapClick({ lat, lng })
          }
        }}
        onDragend={drag => {
          if (onCenterChanged) {
            const center = drag.map.getCenter()
            onCenterChanged({ lat: center.lat(), lng: center.lng() })
          }
        }}
      >
        <RadiusCircle center={defaultCenter} radius={searchRadius} />
        {route && <MapController center={defaultCenter} route={route} />}

        {/* Origin marker for departing from a location */}
        {showOrigin && (
          <AdvancedMarker position={route.path.origin}>
            <Pin scale={0.75} />
          </AdvancedMarker>
        )}

        {/* Destination marker for arriving near a location */}
        {showDestination && (
          <AdvancedMarker position={route.path.destination}>
            <Pin scale={0.75} />
          </AdvancedMarker>
        )}

        {children}
        {events?.map(event => {
          if (!event.lat || !event.lng) return null
          const isRoute =
            Array.isArray(event.origin_coords) ||
            Array.isArray(event.destination_coords)

          return (
            <AdvancedMarker
              key={event.id}
              position={{ lat: event.lat, lng: event.lng }}
              onClick={() => {
                if (isRoute) setSelectedRoute(event)
                else setSelectedEvent(event)
              }}
            >
              <Pin scale={0.75} />
            </AdvancedMarker>
          )
        })}

        {/* Event info window */}
        {selectedEvent && (
          <GenericButton
            unstyled
            onClick={() => navigate(`/event/${selectedEvent.id}`)}
          >
            <InfoWindow
              position={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
              onCloseClick={() => setSelectedEvent(null)}
              disableAutoPan
              shouldFocus={false}
              headerDisabled
              pixelOffset={[0, -32]}
            >
              <div className="pl-1 pr-3 pb-2">
                <div className="flex justify-between items-start gap-4">
                  <p className="font-semibold text-sm text-text-primary">
                    {selectedEvent.title}
                  </p>
                  <GenericButton
                    unstyled
                    customStyling="text-text-secondary shrink-0"
                    onClick={click => {
                      click.stopPropagation()
                      setSelectedEvent(null)
                    }}
                  >
                    <Close />
                  </GenericButton>
                </div>
                <p className="text-xs text-text-primary mt-1 flex items-center gap-0.5">
                  <PlaceOutlined style={{ fontSize: 14 }} />
                  {selectedEvent.location}
                </p>
                <p className="text-xs text-text-primary mt-0.5 flex items-center gap-0.5">
                  <DateRangeRounded style={{ fontSize: 14 }} />
                  {new Date(selectedEvent.event_time).toLocaleString()}
                </p>
                <div className="flex justify-end mt-2">
                  <GenericButton
                    unstyled
                    customStyling="text-xs text-blue-primary font-medium flex items-center gap-0.5"
                    onClick={() => navigate(`/event/${selectedEvent.id}`)}
                  >
                    {mainMapStrings.seeMore}
                    <East style={{ fontSize: 14 }} />
                  </GenericButton>
                </div>
              </div>
            </InfoWindow>
          </GenericButton>
        )}

        {/* Route info window */}
        {selectedRoute && (
          <InfoWindow
            position={{ lat: selectedRoute.lat, lng: selectedRoute.lng }}
            onCloseClick={() => setSelectedRoute(null)}
            disableAutoPan
            shouldFocus={false}
            headerDisabled
            pixelOffset={[0, -32]}
          >
            <div className="pl-3 pb-3 pr-5">
              <div className="flex justify-between items-start gap-4">
                <p className="font-semibold text-sm text-text-primary">
                  {selectedRoute.title}
                </p>
                <GenericButton
                  unstyled
                  customStyling="text-text-secondary shrink-0"
                  onClick={click => {
                    click.stopPropagation()
                    setSelectedRoute(null)
                  }}
                >
                  <Close />
                </GenericButton>
              </div>
              <div className="mt-1">
                <p className="text-xs text-text-primary flex items-center gap-0.5">
                  <PlaceOutlined style={{ fontSize: 14 }} />
                  {selectedRoute.origin}
                </p>
                <p className="text-xs text-text-primary flex items-center gap-0.5">
                  <OutlinedFlagRounded style={{ fontSize: 14 }} />
                  {selectedRoute.destination}
                </p>
              </div>
              <p className="text-xs text-text-primary mt-0.5">
                {new Date(selectedRoute.depart_time).toLocaleString()}
              </p>
              <div className="flex justify-end mt-2">
                <GenericButton
                  unstyled
                  customStyling="text-xs text-blue-primary font-medium flex items-center gap-0.5"
                  onClick={() => {
                    setSelectedRoute(null)
                    onRouteClick?.(selectedRoute)
                  }}
                >
                  {mainMapStrings.seeMore}
                  <East style={{ fontSize: 14 }} />
                </GenericButton>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  )
}

MainMap.propTypes = {
  children: PropTypes.node,
  defaultCenter: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    path: PropTypes.shape({
      departing: PropTypes.bool,
      origin: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }),
      destination: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }),
    }).isRequired,
    transportationMode: PropTypes.string.isRequired,
  }),
  onLoad: PropTypes.func,
  onUnmount: PropTypes.func,
  mapKey: PropTypes.string,
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    })
  ),
  onMapClick: PropTypes.func,
  onCenterChanged: PropTypes.func,
  onRouteClick: PropTypes.func,
  searchRadius: PropTypes.number,
}

MainMap.defaultProps = {
  onLoad: undefined,
  onUnmount: undefined,
  mapKey: undefined,
  events: [],
  onMapClick: undefined,
  onCenterChanged: undefined,
  onRouteClick: undefined,
  searchRadius: 0,
}
