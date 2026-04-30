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

export function locationSetSuccess(setUserLocation) {
  return position => {
    setUserLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    })
  }
}

export function locationSetError() {
  console.log('Location access denied, using default')
}

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
    ? `${process.env.VITE_API_BASE_URL}/api/events?${params}`
    : `${process.env.VITE_API_BASE_URL}/api/routes?${params}`
}
