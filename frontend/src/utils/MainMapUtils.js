import PropTypes from 'prop-types'
import { useMap } from '@vis.gl/react-google-maps'
import { useEffect } from 'react'

/**
 * Converts a PostGIS hex string to a lat/lng object.
 *
 * @param {String} hexString geometry string from PostGIS
 * @returns {Object} lat/lng coordinate object for google maps
 */
export const postGISToLatLng = hexString => {
  const buf = new Uint8Array(hexString.match(/../g).map(b => parseInt(b, 16)))
  const view = new DataView(buf.buffer)
  const lng = view.getFloat64(9, true)
  const lat = view.getFloat64(17, true)
  return { lat, lng }
}

export const RadiusCircle = ({ center, radius }) => {
  const map = useMap()

  useEffect(() => {
    if (!map || !center) return
    const circle = new google.maps.Circle({
      map,
      center,
      radius,
      strokeColor: '#6fa4ea',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#6fa4ea',
      fillOpacity: 0.08,
    })
    return () => circle.setMap(null)
  }, [map, center, radius])

  return null
}

RadiusCircle.propTypes = {
  center: PropTypes.Object,
  radius: PropTypes.Number,
}
