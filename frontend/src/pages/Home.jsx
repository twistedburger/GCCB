import LocationSearch from '../components/LocationSearch'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  Pin,
} from '@vis.gl/react-google-maps'
import GenericToggle from '../components/GenericToggle'
import GenericButton from '../components/GenericButton'
import { Add, PlaceOutlined, TuneOutlined } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import RouteCard from '../components/RouteCard'
import RouteDetail from '../pages/home/RouteDetail'
import Modal from '../components/Modal'
import PropTypes from 'prop-types'
import CreateEvent from '../components/CreateEvent'
import { useAuth } from '../utils/Authorization'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Drawer } from 'vaul'
import { TravelMode } from '../utils/routes'

const originalWarn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Google Maps JavaScript API warning: NoApiKeys')
  )
    return // Suppress no API warning, since key exists
  originalWarn(...args)
}

function Home() {
  const location = useLocation()
  const isEventDetail = location.pathname.includes('/event/')
  const [userLocation, setUserLocation] = useState({ lat: 49.28, lng: -123.12 })
  const [snapPoint, setSnapPoint] = useState(0.095)
  const [routeSnapPoint, setRouteSnapPoint] = useState(0.25)
  const [isArriving, setIsArriving] = useState(true)
  const [address, setAddress] = useState('')
  const [cardsToDisplay, setCardsToDisplay] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [filters, setFilters] = useState({
    time: null,
    transportationModes: [],
    radius: 100,
    verifiedEventsOnly: false,
    mainEventsOnly: true,
  })
  const navigate = useNavigate()
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [alert, setAlert] = useState(null)

  const { authorizeUser, authorization } = useAuth()
  authorizeUser()

  const handleSearch = async newLocation => {
    setAddress(newLocation)
    setSnapPoint(1)
    setSelectedRoute(null)
    setFilters({
      time: null,
      transportationModes: [],
      radius: 100,
      verifiedEventsOnly: false,
      mainEventsOnly: true,
    })

    try {
      const response = await fetch(
        `http://localhost:3000/maps/geocode?address=${encodeURIComponent(newLocation)}`
      )
      const data = await response.json()
      if (data.status === 'OK') {
        const { lat, lng } = data.results[0].geometry.location
        setUserLocation({ lat, lng })
      }
    } catch (err) {
      console.error('geocode fetch failed:', err)
    }
  }

  const handleFormResult = result => {
    if (result.success) {
      setShowCreateEvent(false)
    }

    setAlert({
      type: result.success ? 'success' : 'error',
      text: result.message,
      visible: true,
    })

    setTimeout(() => {
      setAlert(prev => (prev ? { ...prev, visible: false } : null))
    }, 2000)
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        console.log('Location access denied, using default')
      }
    )
  }, [])

  useEffect(() => {
    const fetchCards = async () => {
      const params = new URLSearchParams()

      if (filters.time) params.append('time', filters.time)
      if (filters.transportationModes.length > 0)
        params.append(
          'transportation_modes',
          filters.transportationModes.join(',')
        )
      if (filters.verifiedEventsOnly) params.append('verified', true)
      if (filters.radius) params.append('radius', filters.radius)

      if (filters.mainEventsOnly) {
        const response = await fetch(
          `http://localhost:3000/api/events?${params}`
        )
        const data = await response.json()
        setCardsToDisplay(data)
      } else {
        const response = await fetch(
          `http://localhost:3000/api/routes?${params}`
        )
        const data = await response.json()
        setCardsToDisplay(data)
      }
    }
    fetchCards()
  }, [filters, userLocation])

  const handleRouteClick = route => {
    setSnapPoint(0.095)
    setRouteSnapPoint(0.25)
    setSelectedRoute(route)
  }

  return (
    <div data-vaul-drawer-wrapper className="relative w-full h-full">
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-[100] top-0 text-white text-sm font-semibold px-8 py-3.5 rounded-full shadow-2xl 
        whitespace-nowrap flex items-center gap-2 transition-all duration-500 ease-in-out
        ${alert?.visible ? 'translate-y-12 opacity-100' : '-translate-y-full opacity-0'}
        ${alert?.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
      `}
      >
        {alert?.text}
      </div>

      <div>
        <APIProvider
          apiKey=""
          scriptUrl="http://localhost:3000/maps/api/js"
          libraries={['geometry']}
        >
          <Map
            mapId="6621f78cbdb1902f92a3d543"
            className="absolute w-full h-full"
            defaultCenter={userLocation}
            defaultZoom={17}
            gestureHandling="greedy"
            disableDefaultUI={true}
          >
            <AdvancedMarker position={userLocation}>
              <Pin scale={0.75} />
            </AdvancedMarker>
            <MapController center={userLocation} route={selectedRoute} />
          </Map>
        </APIProvider>

        {!selectedRoute && !isEventDetail && (
          <LocationSearch
            className="rounded-xl absolute inset-x-0 top-0 m-6 z-10 w-auto overflow-visible shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
            focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
            onSearch={handleSearch}
          />
        )}
        <Drawer.Root
          open={true}
          modal={false}
          snapPoints={[0.095, 0.5, 1]}
          activeSnapPoint={snapPoint}
          setActiveSnapPoint={setSnapPoint}
          noBodyStyles={true}
          setBackgroundColorOnScale={false}
          preventScrollRestoration={false}
        >
          <Drawer.Portal>
            <Drawer.Content
              {...(routeSnapPoint === 0.095 ? { inert: true } : {})}
              onOpenAutoFocus={e => e.preventDefault()}
              onFocus={e => {
                if (e.target === e.currentTarget) {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
              style={{
                zIndex: 20,
                marginLeft: '55px',
                width: 'calc(100% - 55px)',
                borderRadius: '24px 24px 0 0',
                height: '96%',
                position: 'fixed',
                bottom: 0,
                background: '#F9F9F9',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'auto',
              }}
            >
              <Drawer.Title className="sr-only">Search Results</Drawer.Title>
              <Drawer.Description className="sr-only">
                Search results near your location
              </Drawer.Description>
              <div
                className="flex justify-center p-6"
                style={{ pointerEvents: 'auto' }}
              >
                <div className="bg-text-primary rounded-full h-1.5 w-20" />
              </div>
              <div className="overflow-y-auto px-6 pb-36 flex flex-col gap-4">
                {address && (
                  <>
                    <div className="flex items-center gap-2 overflow-x-auto shrink-0 min-h-10">
                      <TuneOutlined
                        className="text-text-primary shrink-0"
                        onClick={() => navigate('/filter')}
                      />
                      <GenericToggle
                        value={isArriving}
                        onChange={setIsArriving}
                        labels={['Arriving Near', 'Departing Near']}
                        className="shrink-0"
                      />
                      <span className="text-text-secondary truncate text-sm shrink-0 capitalize">
                        <PlaceOutlined className="mr-1" />
                        {address}
                      </span>
                      <div
                        className="flex gap-2 overflow-x-auto pb-0.5 shrink-0"
                        style={{ scrollbarWidth: 'none' }}
                      >
                        <DisplayFilters
                          filters={filters}
                          setFilters={setFilters}
                        />
                      </div>
                    </div>
                    {cardsToDisplay.length === 0 ? (
                      <p className="text-text-secondary text-sm text-center py-4">
                        No results found. Try adjusting your filters.
                      </p>
                    ) : (
                      cardsToDisplay.map(item =>
                        filters.mainEventsOnly ? (
                          <EventCard
                            key={item.id}
                            event={item}
                            view={authorization}
                          />
                        ) : (
                          <RouteCard
                            key={item.id}
                            route={item}
                            view={authorization}
                            individualView={true}
                            onSelect={route => {
                              handleRouteClick(route)
                              document.activeElement?.blur()
                            }}
                          />
                        )
                      )
                    )}
                  </>
                )}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
        <Drawer.Root
          open={!!selectedRoute}
          onOpenChange={open => !open && setSelectedRoute(null)}
          modal={false}
          snapPoints={[0.095, 0.25, 0.4, 0.8]} // 80% max, so padding in Route Detail is 25% from bottom
          activeSnapPoint={routeSnapPoint}
          setActiveSnapPoint={setRouteSnapPoint}
          noBodyStyles={true}
          setBackgroundColorOnScale={false}
          dismissible={false}
          preventScrollRestoration={false}
        >
          <Drawer.Portal>
            <Drawer.Content
              onOpenAutoFocus={e => e.preventDefault()}
              onFocus={e => {
                if (e.target === e.currentTarget) {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
              style={{
                zIndex: 30,
                marginLeft: '55px',
                width: 'calc(100% - 55px)',
                borderRadius: '24px 24px 0 0',
                height: '96%',
                position: 'fixed',
                bottom: 0,
                background: '#F9F9F9',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'hidden',
                pointerEvents: 'auto',
              }}
            >
              <Drawer.Title className="sr-only">Route Detail</Drawer.Title>
              <Drawer.Description className="sr-only">
                Route and event details
              </Drawer.Description>
              {selectedRoute && (
                <RouteDetail
                  selectedRoute={selectedRoute}
                  onClose={() => {
                    setSelectedRoute(null)
                    setSnapPoint(0.5)
                  }}
                />
              )}
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
        <Outlet
          context={{ filters, setFilters, setSelectedRoute, setSnapPoint }}
        />
      </div>

      {/* Create Event modal */}
      <Modal isOpen={showCreateEvent} onClose={() => setShowCreateEvent(false)}>
        <CreateEvent onSubmit={handleFormResult} />
      </Modal>

      <GenericButton
        unstyled={true}
        customStyling="absolute bottom-24 right-6 z-50 bg-blue-primary text-white rounded-full p-3 shadow-lg 
                transition-transform duration-200 active:scale-100 hover:scale-110"
        onClick={() => {
          setShowCreateEvent(true)
        }}
      >
        <Add fontSize="large" />
      </GenericButton>
    </div>
  )
}

function MapController({ center, route }) {
  const map = useMap()
  useEffect(() => {
    if (map && center) {
      map.panTo(center)
    }
  }, [map, center])

  useEffect(() => {
    if (!map || !route) {
      return
    }

    const routeLine = route.path.polyline.encodedPolyline
    const decodedPath = google.maps.geometry.encoding.decodePath(routeLine)

    const bounds = new google.maps.LatLngBounds()
    decodedPath.forEach(point => bounds.extend(point))
    map.fitBounds(bounds)

    if (route.transportation_mode.toUpperCase() === TravelMode.Transit) {
      // overwrite the line if transit
      const routeLines = []
      const legColors = {
        walk: '#34A853',
        transit: ['#4285F4', '#EA4335'],
      }

      route.path.legs[0].steps.forEach((step, index) => {
        let color =
          step.travelMode === TravelMode.Walk
            ? legColors.walk
            : legColors.transit[index % 2] // alternate color for transfers

        const decodedPath = google.maps.geometry.encoding.decodePath(
          step.polyline.encodedPolyline
        )

        const polyline = new google.maps.Polyline({
          path: decodedPath,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 1.0,
          strokeWeight: 10,
          map,
        })

        routeLines.push(polyline)
      })

      return () => {
        routeLines.forEach(line => line.setMap(null))
        routeLines.length = 0
      }
    } else {
      // else draw the single line
      const polyline = new google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: '#4285F4',
        strokeOpacity: 1.0,
        strokeWeight: 10,
        map,
      })

      return () => polyline.setMap(null)
    }
  }, [map, route])

  return null
}

function DisplayFilters({ filters, setFilters }) {
  const activeFilters = []

  if (filters.time)
    activeFilters.push({
      label: `${filters.time}`,
      key: 'time',
      default: null,
    })
  if (filters.transportationModes.length > 0)
    activeFilters.push({
      label: filters.transportationModes.join(', '),
      key: 'transportationModes',
      default: [],
    })
  if (filters.verifiedEventsOnly)
    activeFilters.push({
      label: 'Verified only',
      key: 'verifiedEventsOnly',
      default: false,
    })
  if (!filters.mainEventsOnly) {
    activeFilters.push({
      label: 'Display Individual Routes',
      key: 'mainEventsOnly',
      default: true,
    })
  }
  if (filters.radius !== 100)
    activeFilters.push({
      label: `${filters.radius}m`,
      key: 'radius',
      default: 100,
    })

  if (activeFilters.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 shrink-0">
      {activeFilters.map(f => (
        <GenericButton
          key={f.key}
          unstyled
          customStyling="flex items-center gap-1 whitespace-nowrap px-3 py-1 rounded-full border border-light-grey bg-white text-[14px] text-text-secondary shrink-0 capitalize"
          onClick={() => {
            setFilters(prev => {
              const updatedFilters = {
                time: prev.time,
                transportationModes: prev.transportationModes,
                radius: prev.radius,
                verifiedEventsOnly: prev.verifiedEventsOnly,
                mainEventsOnly: prev.mainEventsOnly,
              }
              updatedFilters[f.key] = f.default
              return updatedFilters
            })
          }}
        >
          {f.label}
          <span className="text-medium-grey text-xs">✕</span>
        </GenericButton>
      ))}
    </div>
  )
}

MapController.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  route: PropTypes.object.isRequired,
}

DisplayFilters.propTypes = {
  filters: PropTypes.shape({
    time: PropTypes.object,
    transportationModes: PropTypes.arrayOf(PropTypes.string).isRequired,
    verifiedEventsOnly: PropTypes.bool,
    mainEventsOnly: PropTypes.bool,
    radius: PropTypes.number,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
}

export default Home
