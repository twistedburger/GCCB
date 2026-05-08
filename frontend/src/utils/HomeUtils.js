/**
 * Processes the result of an event creation form.
 *
 * @param {Object} result - The response object from the form.
 * @param {Function} setShowCreateEvent - Function to toggle the event creation modal/view.
 * @param {Function} setAlert - Function to trigger a UI alert/notification.
 * @param {Function} onSuccess - Callback to execute on success.
 */
export const handleFormResult = (
  result,
  { setShowCreateEvent, setAlert, onSuccess }
) => {
  if (result.success) {
    setShowCreateEvent(false)
    setAlert({ type: 'success', text: 'Event created successfully.' })
    onSuccess?.()
  } else {
    setAlert({ type: 'error', text: 'Failed to create event.' })
  }
}

/**
 * Returns a success callback that updates state with coordinates.
 *
 * @param {Function} setUserLocation - State setter function for the user's location.
 * @returns {Function} A callback function that accepts a GeolocationPosition object.
 */
export function locationSetSuccess(setUserLocation) {
  return position => {
    setUserLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    })
  }
}

/**
 * Error callback for the Geolocation API.
 */
export function locationSetError() {
  console.log('Location access denied, using default')
}

/**
 * Constructs a backend URL for searching events or routes based on filters and location.
 *
 * @param {Object} filters - The search filter criteria.
 * @param {Object} userLocation - The user's current coordinates.
 * @param {boolean} isArriving - Flag indicating if the search is for arrival or departure.
 * @returns {string} The formatted API endpoint URL with query parameters.
 */
export function buildSearchURL(filters, userLocation, isArriving) {
  const params = new URLSearchParams()
  if (filters.time) params.append('time', filters.time)
  if (filters.transportationModes.length > 0)
    params.append('transportation_modes', filters.transportationModes.join(','))
  if (filters.verifiedEventsOnly) params.append('verified', true)
  if (filters.radius) params.append('radius', filters.radius)
  params.append('isArriving', isArriving)
  params.append('longitude', userLocation.lng)
  params.append('latitude', userLocation.lat)

  return filters.mainEventsOnly
    ? `${import.meta.env.VITE_API_BASE_URL}/api/events?${params}`
    : `${import.meta.env.VITE_API_BASE_URL}/api/routes?${params}`
}

/**
 * Converts coordinates into a readable street address using Google Maps Geocoder.
 *
 * @param {Object} latLng - The coordinates to geocode.
 * @returns {Promise<string>} A promise that resolves to the formatted address string.
 */
export function reverseGeocode(latLng) {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve(results[0].formatted_address)
      } else {
        reject(status)
      }
    })
  })
}

/**
 * Determines if the map has panned significantly away from the user's location based on a threshold.
 *
 * @param {Object} newCenter - The current center coordinates of the map.
 * @param {Object} userLocation - The user's original/stored location coordinates.
 * @param {number} [threshold=0.001] - The maximum total coordinate difference allowed before returning true.
 * @returns {boolean} True if the distance exceeds the threshold, false otherwise.
 */
export function hasMapPanned(newCenter, userLocation, threshold = 0.001) {
  const dist =
    Math.abs(newCenter.lat - userLocation.lat) +
    Math.abs(newCenter.lng - userLocation.lng)
  return dist > threshold
}
