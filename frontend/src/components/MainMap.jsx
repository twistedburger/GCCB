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
import { Close } from '@mui/icons-material'
import { RadiusCircle } from '../utils/MainMapUtils'

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
  defaultPin,
  events,
  onMapClick,
  onCenterChanged,
  searchRadius = 2000,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const navigate = useNavigate()

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
        {defaultPin && (
          <AdvancedMarker position={defaultCenter}>
            {/* to do: decide to remove this pin fully. will get cluttered if event pins are showing. */}
            <Pin scale={0} />
          </AdvancedMarker>
        )}
        {route && <MapController center={defaultCenter} route={route} />}
        {children}
        {events?.map(
          event =>
            event.lat &&
            event.lng && (
              <AdvancedMarker
                key={event.id}
                position={{ lat: event.lat, lng: event.lng }}
                onClick={() => setSelectedEvent(event)}
              >
                <Pin scale={0.75} />
              </AdvancedMarker>
            )
        )}
        {selectedEvent && (
          <GenericButton
            unstyled
            onClick={() => {
              navigate(`/event/${selectedEvent.id}`)
            }}
          >
            <InfoWindow
              position={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
              onCloseClick={() => setSelectedEvent(null)}
              disableAutoPan
              shouldFocus={false}
              headerDisabled
              pixelOffset={[0, -32]}
            >
              <div className="pl-3 pb-3 pr-5">
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
                    <Close></Close>
                  </GenericButton>
                </div>
                <p className="text-xs text-text-primary mt-1">
                  {selectedEvent.location}
                </p>
                <p className="text-xs text-text-primary mt-0.5">
                  {new Date(selectedEvent.event_time).toLocaleString()}
                </p>
              </div>
            </InfoWindow>
          </GenericButton>
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
    path: PropTypes.object.isRequired,
    transportationMode: PropTypes.string.isRequired,
  }).isRequired,
  onLoad: PropTypes.func,
  onUnmount: PropTypes.func,
  mapKey: PropTypes.string,
  defaultPin: PropTypes.bool,
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    })
  ),
  onMapClick: PropTypes.func,
  onCenterChanged: PropTypes.func,
  searchRadius: PropTypes.Number,
}

MainMap.defaultProps = {
  onLoad: undefined,
  onUnmount: undefined,
  mapKey: undefined,
  defaultPin: false,
  events: [],
  onMapClick: undefined,
  onCenterChanged: undefined,
  searchRadius: 0,
}
