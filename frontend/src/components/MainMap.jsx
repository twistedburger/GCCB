import PropTypes from 'prop-types'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps'
import MapController from './MapController'

/**
 * Component to display the main map.
 *
 * @param {React.ReactNode} children - The child nodes to render inside the map.
 * @param {Object} defaultCenter - The default center position for the map.
 * @param {Object} route - The route information for the map.
 * @param {Function} onLoad - The function to call when the map is loaded.
 * @param {Function} onUnmount - The function to call when the map is unmounted.
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
}) {
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
        defaultZoom={17}
        gestureHandling="greedy"
        disableDefaultUI={true}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {defaultPin && (
          <AdvancedMarker position={defaultCenter}>
            {/* to do: decide to remove this pin fully */}
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
              >
                <Pin scale={0.75} />
              </AdvancedMarker>
            )
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
}

MainMap.defaultProps = {
  onLoad: undefined,
  onUnmount: undefined,
  mapKey: undefined,
  defaultPin: false,
  events: [],
}
