import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import TextBox from './TextBox'
import GenericButton from './GenericButton'
import LocationSearch from './LocationSearch'
import TransportationModeSelect from './TransportationModeSelect'
import { calculateRoute, TravelMode } from '../utils/routes'
import { decode } from 'google-polyline'
import { GoogleMap, useJsApiLoader, Polyline } from '@react-google-maps/api'

const CreateRoute = ({ initLoc, onSubmit }) => {
  const [routeName, setRouteName] = useState('')
  const [routeDesc, setRouteDesc] = useState('')
  const [transportationMode, setTransportationMode] = useState('')
  const [maxPeople, setMaxPeople] = useState(1)
  const [departTime, setDepartTime] = useState('')
  const [startLoc, setStartLoc] = useState(null)
  const [endLoc, setEndLoc] = useState(initLoc)
  const [distance, setDistance] = useState(null)
  const [polyline, setPolyline] = useState(null)
  const [errors, setErrors] = useState({})
  const [routePreview, setRoutePreview] = useState(null)
  const [isFetchingRoute, setIsFetchingRoute] = useState(false)
  const [routeError, setRouteError] = useState(null)
  const [mapKey, setMapKey] = useState(0)
  const [map, setMap] = useState(null)
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

  const validate = () => {
    const newErrors = {}
    if (!routeName.trim()) newErrors.routeName = 'Route name is required'
    if (!transportationMode)
      newErrors.transportationMode = 'Select a transportation mode'
    if (
      transportationMode &&
      (maxPeople < 1 || maxPeople > 10 || !Number.isInteger(maxPeople))
    ) {
      newErrors.maxPeople = 'Must be a whole number between 1 and 10'
    }
    if (!startLoc) newErrors.startLoc = 'Starting location is required'
    if (!endLoc) newErrors.endLoc = 'Destination is required'
    if (!departTime) newErrors.departTime = 'Departure time is required'
    return newErrors
  }

  const handleGetRoute = async () => {
    setRoutePreview(null)
    setIsFetchingRoute(true)
    setRouteError(null)
    setMapKey(prev => prev + 1)
    try {
      const modeMapping = {
        bus: 'Transit',
        walk: 'Walk',
        bicycle: 'Bike',
        car: 'Carpool',
      }

      const modeKey = modeMapping[transportationMode.toLowerCase()]
      const selectedMode = TravelMode[modeKey]

      const route = await calculateRoute(
        { address: startLoc },
        { address: endLoc },
        selectedMode,
        {
          _departureTime: departTime
            ? new Date(departTime).toISOString()
            : null,
        }
      )
      console.log('Route preview data:', route)
      setRoutePreview(route)
      setDistance(route.distanceMeters)
      setPolyline(route.polyline.encodedPolyline)
    } catch (err) {
      setRouteError(err.message)
      setRoutePreview(null)
    } finally {
      setIsFetchingRoute(false)
    }
  }

  const pathCoordinates = routePreview?.polyline?.encodedPolyline
    ? decode(routePreview.polyline.encodedPolyline).map(([lat, lng]) => ({
        lat,
        lng,
      }))
    : []

  const handleAddRoute = e => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    const routeData = {
      title: routeName,
      transportation_mode: transportationMode,
      max_ppl: maxPeople,
      origin: startLoc,
      destination: endLoc || initLoc,
      depart_time: departTime,
      description: routeDesc,
      distance: distance,
      path: polyline,
      completed: false,
    }
    onSubmit(routeData)
  }

  useEffect(() => {
    if (map && pathCoordinates.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      pathCoordinates.forEach(point => bounds.extend(point))
      map.fitBounds(bounds)
    }
  }, [map, pathCoordinates])

  return (
    <div className="space-y-4">
      <TextBox
        label="Route Name"
        value={routeName}
        onChange={e => setRouteName(e.target.value)}
        error={errors.routeName}
      />

      <TransportationModeSelect
        selectedModes={[]}
        onChange={modes => {
          setTransportationMode(modes || '')
          setRoutePreview(null)
          setRouteError(null)
        }}
        multiple={false}
      />
      {errors.transportationMode && (
        <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
          {errors.transportationMode}
        </p>
      )}
      {transportationMode && (
        <div>
          <label className="text-text-primary text-sm font-semibold mb-1 block ml-1">
            Max Number of People
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={maxPeople}
            onChange={e => {
              const val = parseInt(e.target.value)
              setMaxPeople(val)
            }}
            className="w-full px-4 py-3 rounded-xl transition-all duration-200 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
              bg-gray-50 text-text-primary outline-none border border-transparent focus:border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          {errors.maxPeople && (
            <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
              {errors.maxPeople}
            </p>
          )}
        </div>
      )}

      {/*TODO: ensure departure time doesn't exceed event time */}
      <div>
        <label
          className="text-sm font-semibold text-text-primary ml-1 mb-1.5 block"
          htmlFor="depart-time"
        >
          Departure Time
        </label>
        <input
          id="depart-time"
          type="datetime-local"
          value={departTime}
          onChange={e => setDepartTime(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl transition-all duration-200 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
             bg-gray-50 text-text-primary outline-none border
             ${errors.departTime ? 'border-red-500' : 'border-transparent focus:border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'}`}
        />
        {errors.departTime && (
          <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
            {errors.departTime}
          </p>
        )}
      </div>

      <div>
        <label className="text-text-primary text-sm font-semibold mb-1 block ml-1">
          Starting Location
        </label>
        <LocationSearch
          placeHolder="Enter starting location"
          className={`w-full flex justify-end rounded-xl bg-gray-50 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
            outline-none transition-all text-text-primary placeholder:text-secondary
            ${errors.startLoc ? 'border border-red-500' : 'focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100'}`}
          onSearch={location => setStartLoc(location)}
        />
        {errors.startLoc && (
          <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
            {errors.startLoc}
          </p>
        )}
      </div>
      <div>
        <label className="text-text-primary text-sm font-semibold mb-1 block ml-1">
          Destination
        </label>
        <LocationSearch
          defaultLocation={endLoc}
          placeHolder="Enter destination"
          className={`w-full flex justify-end rounded-xl bg-gray-50 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
            outline-none transition-all text-text-primary placeholder:text-secondary
            ${errors.endLoc ? 'border border-red-500' : 'focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100'}`}
          onSearch={location => setEndLoc(location)}
          disabled={!!initLoc}
        />
        {errors.endLoc && (
          <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
            {errors.endLoc}
          </p>
        )}
      </div>

      {/* Get Route button */}
      {transportationMode && departTime && startLoc && endLoc && (
        <div className="flex flex-col items-center py-2">
          <GenericButton
            type="button"
            onClick={handleGetRoute}
            disabled={isFetchingRoute}
            className="w-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
          >
            {isFetchingRoute ? 'Calculating...' : 'Preview Route Path'}
          </GenericButton>
          {routeError && (
            <p className="text-red-500 text-xs mt-1">{routeError}</p>
          )}
        </div>
      )}

      {/* Mini Map */}
      <div className="rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 h-64 relative shadow-inner">
        {!isLoaded ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Loading Map...
          </div>
        ) : (
          <GoogleMap
            key={mapKey}
            mapContainerStyle={{ width: '100%', height: '100%' }}
            zoom={12}
            center={pathCoordinates[0] || { lat: 49.2827, lng: -123.1207 }}
            onLoad={setMap} // Save the map instance to state
            onUnmount={() => setMap(null)} // Clean up when the component destroys
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            {pathCoordinates.length > 0 && (
              <Polyline
                key={routePreview.polyline.encodedPolyline}
                path={pathCoordinates}
                options={{
                  strokeColor: '#3b82f6',
                  strokeOpacity: 0.8,
                  strokeWeight: 6,
                }}
              />
            )}

            {!routePreview && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 text-gray-400 text-sm italic px-10 text-center">
                {startLoc && endLoc
                  ? "Locations set! Click 'Preview' to see the path."
                  : 'Select transportation mode, departure time, origin, and destination to preview the route map.'}
              </div>
            )}
          </GoogleMap>
        )}
      </div>

      <TextBox
        label="Route Description"
        value={routeDesc}
        onChange={e => setRouteDesc(e.target.value)}
        multiline
      />

      <div className="flex justify-end">
        <GenericButton type="button" onClick={handleAddRoute}>
          Confirm Route
        </GenericButton>
      </div>
    </div>
  )
}

export default CreateRoute

CreateRoute.propTypes = {
  initLoc: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
}
