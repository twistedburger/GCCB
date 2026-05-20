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
 * Reverse geocodes a lat/lng into a human-readable address.
 *
 * @param {Object} latLng - The { lat, lng } coordinate to reverse geocode.
 * @returns {Promise<string>} The formatted address as [street, city, country].
 */
export const reverseGeocode = async ({ lat, lng }) => {
  const geocoder = new google.maps.Geocoder()
  const { results } = await geocoder.geocode({ location: { lat, lng } })
  if (!results[0]) {
    throw new Error(mainMapStrings.geocodingFailed)
  }

  const components = results[0].address_components

  const streetNumber =
    components.find(comp => comp.types.includes('street_number'))?.long_name ??
    ''
  const street =
    components.find(comp => comp.types.includes('route'))?.long_name ?? ''
  const city =
    components.find(
      comp =>
        comp.types.includes('locality') || comp.types.includes('sublocality')
    )?.long_name ?? ''
  const province =
    components.find(comp => comp.types.includes('administrative_area_level_1'))
      ?.short_name ?? ''
  const postalCode =
    components.find(comp => comp.types.includes('postal_code'))?.long_name ?? ''
  const country =
    components.find(comp => comp.types.includes('country'))?.long_name ?? ''

  const streetLine = [streetNumber, street].filter(Boolean).join(' ')
  const cityLine = [city, province, postalCode].filter(Boolean).join(', ')

  return [streetLine, cityLine, country].filter(Boolean)
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
      clickable: false,
    })
    return () => circle.setMap(null)
  }, [map, center, radius])

  return null
}

RadiusCircle.propTypes = {
  center: PropTypes.Object,
  radius: PropTypes.Number,
}
