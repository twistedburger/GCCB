import PropTypes from 'prop-types'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps'
import MapController from './MapController'

export default function MainMap({
  children,
  defaultCenter,
  route,
  onLoad,
  onUnmount,
  mapKey,
  defaultPin,
}) {
  return (
    <APIProvider
      apiKey=""
      scriptUrl="http://localhost:3000/maps/api/js"
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
            <Pin scale={0.75} />
          </AdvancedMarker>
        )}
        {route && <MapController center={defaultCenter} route={route} />}
        {children}
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
}

MainMap.defaultProps = {
  onLoad: undefined,
  onUnmount: undefined,
  mapKey: undefined,
  defaultPin: false,
}
