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
