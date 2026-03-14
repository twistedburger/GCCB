import SearchBar from '../components/SearchBar'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  Pin,
} from '@vis.gl/react-google-maps'
import GenericToggle from '../components/GenericToggle'
import { PlaceOutlined, TuneOutlined } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import RouteCard from '../components/RouteCard'
import RouteDetail from '../pages/home/RouteDetail'
import PropTypes from 'prop-types'
import { useAuth } from '../utils/Authorization'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Drawer } from 'vaul'

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
  const { authorizeUser } = useAuth()
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
      <div>
        <APIProvider apiKey="">
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
            <MapController center={userLocation} />
          </Map>
        </APIProvider>
        {!selectedRoute && !isEventDetail && (
          <SearchBar onSearch={handleSearch} />
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
                    <div className="flex items-center gap-2">
                      <TuneOutlined
                        className="text-text-primary"
                        onClick={() => navigate('/filter')}
                      />
                      <GenericToggle
                        value={isArriving}
                        onChange={setIsArriving}
                        labels={['Arriving Near', 'Departing Near']}
                        className="shrink-0"
                      />
                      <span className="text-text-secondary truncate text-sm">
                        <PlaceOutlined className="mr-1" />
                        {address}
                      </span>
                    </div>
                    {cardsToDisplay.length === 0 ? (
                      <p className="text-text-secondary text-sm text-center py-4">
                        No results found. Try adjusting your filters.
                      </p>
                    ) : (
                      cardsToDisplay.map(item =>
                        filters.mainEventsOnly ? (
                          <EventCard key={item.id} event={item} />
                        ) : (
                          <RouteCard
                            key={item.id}
                            route={item}
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
          snapPoints={[0.095, 0.25, 0.4]}
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
    </div>
  )
}

function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (map && center) {
      map.panTo(center)
    }
  }, [map, center])
  return null
}

MapController.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
}

export default Home
