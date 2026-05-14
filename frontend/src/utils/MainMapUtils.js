import PropTypes from 'prop-types'
import { useMap } from '@vis.gl/react-google-maps'
import { useEffect } from 'react'
import { mainMapStrings } from '../locales/en/ComponentStrings/MainMapStrings'

/**
 * Converts a PostGIS hex string to a lat/lng object.
 *
 * @param {String} point - The geometry string from PostGIS.
 * @returns {Object} The lat/lng coordinate object for google maps.
 */
export const postGISToLatLng = point => {
  if (!point || typeof point !== 'string') return null

  try {
    const buf = new Uint8Array(point.match(/../g).map(b => parseInt(b, 16)))
    const view = new DataView(buf.buffer)
    const lng = view.getFloat64(9, true)
    const lat = view.getFloat64(17, true)

    return { lat, lng }
  } catch (error) {
    console.error(mainMapStrings.error.parsePostGIS, error)
    return null
  }
}

/**
 * Creates a Circle component for users to see their search radius and renders it on the map.
 *
 * @param {Object} center - The center coordinates of the circle.
 * @param {number} radius - The radius of the circle in meters.
 */
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
