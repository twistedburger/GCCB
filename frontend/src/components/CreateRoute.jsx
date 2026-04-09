import PropTypes from 'prop-types'
import { useState, useEffect, useMemo } from 'react'
import TextBox from './TextBox'
import GenericButton from './GenericButton'
import LocationSearch from './LocationSearch'
import TransportationModeSelect from './TransportationModeSelect'
import {
  calculateRoute,
  calculateTransitLegs,
  TravelMode,
} from '../utils/RouteUtils'
import { decode } from 'google-polyline'
import TransitLegCard from './TransitLegCard'
import MainMap from './MainMap'
import GenericToggle from './GenericToggle'
import { createRouteStrings } from '../locales/en/ComponentStrings/CreateRouteStrings'

const CreateRoute = ({ initLoc, onSubmit }) => {
  const [routeName, setRouteName] = useState('')
  const [routeDesc, setRouteDesc] = useState('')
  const [transportationMode, setTransportationMode] = useState('')
  const [maxPeople, setMaxPeople] = useState(1)
  const [departTime, setDepartTime] = useState('')
  const [startLoc, setStartLoc] = useState(null)
  const [endLoc, setEndLoc] = useState(initLoc)
  const [latLng, setlatLng] = useState(null)
  const [distance, setDistance] = useState(null)
  const [route, setRoute] = useState(null)
  const [errors, setErrors] = useState({})
  const [isFetchingRoute, setIsFetchingRoute] = useState(false)
  const [routeError, setRouteError] = useState(null)
  const [mapKey, setMapKey] = useState(0)
  const [map, setMap] = useState(null)
  const [isEV, setIsEV] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!routeName.trim())
      newErrors.routeName = createRouteStrings.routeNameRequired
    if (!transportationMode)
      newErrors.transportationMode = createRouteStrings.selectTransportMode
    if (
      transportationMode &&
      (maxPeople < 1 || maxPeople > 10 || !Number.isInteger(maxPeople))
    ) {
      newErrors.maxPeople = createRouteStrings.between1And10
    }
    if (!startLoc) newErrors.startLoc = createRouteStrings.startingLocRequired
    if (!endLoc) newErrors.endLoc = createRouteStrings.destinationLocRequired
    if (!departTime)
      newErrors.departTime = createRouteStrings.departureTimeRequired
    if (transportationMode && startLoc && endLoc && departTime && !route) {
      newErrors.route = createRouteStrings.clickGetRoute
    }
    return newErrors
  }

  const handleGetRoute = async () => {
    setRoute(null)
    setIsFetchingRoute(true)
    setRouteError(null)
    setMapKey(prev => prev + 1)
    try {
      const modeMapping = {
        transit: 'Transit',
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
      setDistance(route.distanceMeters)
      setRoute(route)
      setErrors(prev => ({ ...prev, route: null }))
    } catch (err) {
      setRouteError(err.message)
      setRoute(null)
    } finally {
      setIsFetchingRoute(false)
    }
  }

  const pathCoordinates = useMemo(() => {
    return route?.polyline?.encodedPolyline
      ? decode(route.polyline.encodedPolyline).map(([lat, lng]) => ({
          lat,
          lng,
        }))
      : []
  }, [route])

  const { transitLegs } = useMemo(() => {
    if (!route) return { transitLegs: [] }
    return calculateTransitLegs({
      path: route,
      transportationMode: transportationMode,
    })
  }, [route, transportationMode])

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
      transportationMode: transportationMode,
      maxPpl: maxPeople,
      origin: startLoc,
      originLat: route?.startLocation.latitude,
      originLng: route?.startLocation.longitude,
      destination: endLoc || initLoc,
      departTime: departTime,
      description: routeDesc,
      distance: distance,
      path: route,
      completed: false,
      latitude: latLng[0],
      longitude: latLng[1],
    }
    onSubmit(routeData)
  }

  useEffect(() => {
    if (map && pathCoordinates.length > 0) {
      const bounds = new window.google.maps.latLngBounds()
      pathCoordinates.forEach(point => bounds.extend(point))
      map.fitBounds(bounds)
    }
  }, [map, pathCoordinates])

  return (
    <div className="space-y-4">
      <TextBox
        label={createRouteStrings.routeNameLabel}
        value={routeName}
        onChange={e => setRouteName(e.target.value)}
        error={errors.routeName}
      />

      <TransportationModeSelect
        selectedModes={[]}
        onChange={modes => {
          setTransportationMode(modes || '')
          setRoute(null)
          setRouteError(null)
        }}
        multiple={false}
      />
      {errors.transportationMode && (
        <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
          {errors.transportationMode}
        </p>
      )}

      {/* When car is selected, show gas vs EV toggle and max people input */}
      {transportationMode === 'car' && (
        <GenericToggle
          labels={[createRouteStrings.gas, createRouteStrings.EV]}
          value={!isEV}
          onChange={newValue => {
            setIsEV(!newValue)
          }}
        />
      )}

      {transportationMode === 'car' && (
        <div>
          <label className="text-text-primary text-sm font-semibold mb-1 block ml-1">
            {createRouteStrings.maxPeople}
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
          {createRouteStrings.departureTimeLabel}
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
          {createRouteStrings.startingLocLabel}
        </label>
        <LocationSearch
          placeHolder={createRouteStrings.startingLocPlaceholder}
          className={`w-full flex justify-end rounded-xl bg-gray-50 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
            outline-none transition-all text-text-primary placeholder:text-secondary
            ${errors.startLoc ? 'border border-red-500' : 'focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100'}`}
          onSearch={(location, latitude, longitude) => {
            setStartLoc(location)
            setlatLng([latitude, longitude])
          }}
        />
        {errors.startLoc && (
          <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
            {errors.startLoc}
          </p>
        )}
      </div>
      <div>
        <label className="text-text-primary text-sm font-semibold mb-1 block ml-1">
          {createRouteStrings.destinationLabel}
        </label>
        <LocationSearch
          defaultLocation={endLoc}
          placeHolder={createRouteStrings.destinationPlaceholder}
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
            {isFetchingRoute
              ? createRouteStrings.calculating
              : createRouteStrings.getRoute}
          </GenericButton>
          {routeError && (
            <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
              {routeError}
            </p>
          )}
        </div>
      )}
      {departTime && startLoc && endLoc && errors.route && (
        <p className="flex justify-end text-red-500 text-xs">{errors.route}</p>
      )}

      {/* Mini Map */}
      <div className="rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 h-64 relative shadow-inner">
        <MainMap
          defaultCenter={pathCoordinates[0] || { lat: 49.2827, lng: -123.1207 }}
          route={
            route
              ? { path: route, transportationMode: transportationMode }
              : null
          }
          onLoad={setMap}
          onUnmount={() => setMap(null)}
          mapKey={mapKey}
        >
          {!route && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 text-gray-400 text-sm italic px-10 text-center">
              {transportationMode && departTime && startLoc && endLoc
                ? createRouteStrings.seePath
                : createRouteStrings.selectModeTimeOriginDestination}
            </div>
          )}
        </MainMap>
      </div>
      <p className="font-semibold pt-4 pb-2 text-text-primary">
        {transitLegs.length > 0 ? createRouteStrings.transitDetails : ''}
      </p>
      <div className="flex flex-col gap-2">
        {transitLegs.map((leg, index) => (
          <TransitLegCard
            key={index}
            name={leg.name}
            type={leg.type}
            distance={leg.distance}
          />
        ))}
      </div>
      <TextBox
        label={createRouteStrings.routeDescLabel}
        value={routeDesc}
        onChange={e => setRouteDesc(e.target.value)}
        multiline
      />

      <div className="flex justify-end">
        <GenericButton type="button" onClick={handleAddRoute}>
          {createRouteStrings.confirmRoute}
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
