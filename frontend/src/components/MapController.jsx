import { useEffect } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import PropTypes from 'prop-types'
import { DrawRoute } from '../utils/MapControllerUtils'

/**
 * Component to control the map view and display route information.
 *
 * @param {Object} center - The center position for the map.
 * @param {Object} route - The route information for the map.
 * @returns {JSX.Element}
 */

export default function MapController({ center, route }) {
  const map = useMap()
  useEffect(() => {
    if (map && center) {
      map.panTo(center)
    }
  }, [map, center])

  useEffect(() => {
    return DrawRoute(map, route)
  }, [map, route])

  return null
}

MapController.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  route: PropTypes.object.isRequired,
}
