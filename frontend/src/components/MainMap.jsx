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
import { RadiusCircle, reverseGeocode } from '../utils/MainMapUtils'
import { mainMapStrings } from '../locales/en/ComponentStrings/MainMapStrings'

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
  const [activeWindow, setActiveWindow] = useState({ type: null, data: null })
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
        onClick={async mapClick => {
          if (!route) {
            const { lat, lng } = mapClick.detail.latLng
            setActiveWindow({
              type: 'clicked',
              data: { lat, lng, address: null, loading: true },
            })

            const address = await reverseGeocode({ lat, lng })
            setActiveWindow({
              type: 'clicked',
              data: { lat, lng, address, loading: false },
            })
          }
        }}
        onDragend={drag => {
          if (onCenterChanged) {
            const center = drag.map.getCenter()
            onCenterChanged({ lat: center.lat(), lng: center.lng() })
          }
        }}
        clickableIcons={false}
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
        {!route &&
          events?.map(event => {
            if (!event.lat || !event.lng) return null
            const isRoute =
              Array.isArray(event.origin_coords) ||
              Array.isArray(event.destination_coords)

            return (
              <AdvancedMarker
                key={event.id}
                position={{ lat: event.lat, lng: event.lng }}
                onClick={() => {
                  if (isRoute) {
                    setActiveWindow({ type: 'route', data: event })
                  } else {
                    setActiveWindow({ type: 'event', data: event })
                  }
                }}
              >
                <Pin scale={0.75} />
              </AdvancedMarker>
            )
          })}

        {activeWindow.type === 'clicked' && (
          <InfoWindow
            position={{
              lat: activeWindow.data.lat,
              lng: activeWindow.data.lng,
            }}
            onCloseClick={() => setActiveWindow({ type: null, data: null })}
            disableAutoPan
            shouldFocus={false}
            headerDisabled
            pixelOffset={[0, -8]}
          >
            <div className="pl-1 pb-3 pr-2 flex flex-col items-center w-full">
              <div className="flex justify-between items-start gap-4">
                <p className="text-xs text-text-primary mt-1">
                  {activeWindow.data.loading
                    ? mainMapStrings.loading
                    : activeWindow.data.address?.map((line, i) => (
                        <span key={i} className="block">
                          {line}
                        </span>
                      ))}
                </p>
                <GenericButton
                  unstyled
                  customStyling="text-text-secondary shrink-0"
                  onClick={e => {
                    e.stopPropagation()
                    setActiveWindow({ type: null, data: null })
                  }}
                >
                  <Close />
                </GenericButton>
              </div>

              <GenericButton
                customStyling="flex items-center gap-1 text-xs"
                onClick={() => {
                  if (onMapClick)
                    onMapClick({
                      lat: activeWindow.data.lat,
                      lng: activeWindow.data.lng,
                    })
                  setActiveWindow({ type: null, data: null })
                }}
              >
                {mainMapStrings.createEvent}
              </GenericButton>
            </div>
          </InfoWindow>
        )}

        {activeWindow.type === 'event' && (
          <InfoWindow
            position={{
              lat: activeWindow.data.lat,
              lng: activeWindow.data.lng,
            }}
            onCloseClick={() => setActiveWindow({ type: null, data: null })}
            disableAutoPan
            shouldFocus={false}
            headerDisabled
            pixelOffset={[0, -32]}
          >
            <div className="pl-1 pr-3 pb-2">
              <div className="flex justify-between items-start gap-4">
                <p className="font-semibold text-sm text-text-primary">
                  {activeWindow.data.title}
                </p>
                <GenericButton
                  unstyled
                  customStyling="text-text-secondary shrink-0"
                  onClick={click => {
                    click.stopPropagation()
                    setActiveWindow({ type: null, data: null })
                  }}
                >
                  <Close />
                </GenericButton>
              </div>
              <p className="text-xs text-text-primary mt-1 flex items-center gap-0.5">
                <PlaceOutlined style={{ fontSize: 14 }} />
                {activeWindow.data.location}
              </p>
              <p className="text-xs text-text-primary mt-0.5 flex items-center gap-0.5">
                <DateRangeRounded style={{ fontSize: 14 }} />
                {new Date(activeWindow.data.event_time).toLocaleString()}
              </p>
              <div className="flex justify-end mt-2">
                <GenericButton
                  unstyled
                  customStyling="text-xs text-blue-primary font-medium flex items-center gap-0.5"
                  onClick={() => {
                    const id = activeWindow.data.id
                    setActiveWindow({ type: null, data: null })
                    navigate(`/event/${id}`)
                  }}
                >
                  {mainMapStrings.seeMore}
                  <East style={{ fontSize: 14 }} />
                </GenericButton>
              </div>
            </div>
          </InfoWindow>
        )}

        {activeWindow.type === 'route' && (
          <InfoWindow
            position={{
              lat: activeWindow.data.lat,
              lng: activeWindow.data.lng,
            }}
            onCloseClick={() => setActiveWindow({ type: null, data: null })}
            disableAutoPan
            shouldFocus={false}
            headerDisabled
            pixelOffset={[0, -32]}
          >
            <div className="pl-3 pb-3 pr-5">
              <div className="flex justify-between items-start gap-4">
                <p className="font-semibold text-sm text-text-primary">
                  {activeWindow.data.title}
                </p>
                <GenericButton
                  unstyled
                  customStyling="text-text-secondary shrink-0"
                  onClick={click => {
                    click.stopPropagation()
                    setActiveWindow({ type: null, data: null })
                  }}
                >
                  <Close />
                </GenericButton>
              </div>
              <div className="mt-1">
                <p className="text-xs text-text-primary flex items-center gap-0.5">
                  <PlaceOutlined style={{ fontSize: 14 }} />
                  {activeWindow.data.origin}
                </p>
                <p className="text-xs text-text-primary flex items-center gap-0.5">
                  <OutlinedFlagRounded style={{ fontSize: 14 }} />
                  {activeWindow.data.destination}
                </p>
              </div>
              <p className="text-xs text-text-primary mt-0.5">
                {new Date(activeWindow.data.depart_time).toLocaleString()}
              </p>
              <div className="flex justify-end mt-2">
                <GenericButton
                  unstyled
                  customStyling="text-xs text-blue-primary font-medium flex items-center gap-0.5"
                  onClick={() => {
                    const currentRouteData = activeWindow.data
                    setActiveWindow({ type: null, data: null })
                    onRouteClick?.(currentRouteData)
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
