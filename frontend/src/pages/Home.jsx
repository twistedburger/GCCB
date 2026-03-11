import LocationSearch from '../components/LocationSearch'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  Pin,
} from '@vis.gl/react-google-maps'
import SliderCard from '../components/SliderCard'
import GenericToggle from '../components/GenericToggle'
import { Add, Close, PlaceOutlined, TuneOutlined } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import RouteCard from '../components/RouteCard'
import PropTypes from 'prop-types'
import CreateEvent from '../components/CreateEvent'
import GenericButton from '../components/GenericButton'
import { useAuth } from '../utils/Authorization'
import { useNavigate, useLocation } from 'react-router-dom'
import Filter from '../pages/home/Filter'
import Report from '../pages/home/Report'
import EventDetail from '../pages/home/EventDetail'

function Home() {
  const [userLocation, setUserLocation] = useState({ lat: 49.28, lng: -123.12 })
  const [isExpanded, setIsExpanded] = useState(false)
  const [isArriving, setIsArriving] = useState(true)
  const [address, setAddress] = useState('')
  const [cardsToDisplay, setCardsToDisplay] = useState([])
  const [filters, setFilters] = useState({
    time: null,
    transportationModes: [],
    radius: 100,
    verifiedEventsOnly: false,
    mainEventsOnly: true,
  })
  const navigate = useNavigate()
  const location = useLocation()
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const { authorizeUser } = useAuth()
  authorizeUser()

  const handleSearch = async newLocation => {
    setAddress(newLocation)
    setIsExpanded(true)
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

  useEffect(() => {
    if (location.state?.filters) {
      setFilters(location.state.filters)
    }
  }, [location.state])

  //trigger animation when showCreateEvent changes
  useEffect(() => {
    if (showCreateEvent) {
      setTimeout(() => setAnimateIn(true), 10)
    } else {
      setAnimateIn(false)
    }
  }, [showCreateEvent])

  return (
    <div className="relative w-full h-full">
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

      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 w-9/10 overflow-visible">
        <LocationSearch onSearch={handleSearch} />
      </div>

      <SliderCard key={address} isExpanded={isExpanded}>
        {address && (
          <>
            <div className="flex items-center gap-2">
              <TuneOutlined
                className="text-text-primary"
                onClick={() => {
                  navigate('/filter', { state: { filters } })
                }}
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
                  <RouteCard key={item.id} route={item} individualView={true} />
                )
              )
            )}
          </>
        )}
      </SliderCard>
      {location.pathname === '/filter' && <Filter />}
      {location.pathname.startsWith('/event/') && <EventDetail />}
      {location.pathname.startsWith('/report') && <Report />}

      {/* Create Event modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          {/* soft transition, blur backdrop */}
          <div
            onClick={() => setShowCreateEvent(false)}
            className={`absolute inset-0 bg-slate-900/40 transition-all duration-500 ease-out
            ${animateIn ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none'}`}
          />

          {/* modal content */}
          <div
            className={`relative bg-white w-full max-w-lg rounded-3xl shadow-2xl 
              max-h-[90vh] overflow-auto transform transition-all duration-300 ease-out
          ${
            animateIn
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-8'
          }`}
          >
            <button
              onClick={() => setShowCreateEvent(false)}
              className="absolute top-4 right-4 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <Close fontSize="large" />
            </button>
            <div className="p-8 overflow-auto">
              <CreateEvent onSubmit={() => setShowCreateEvent(false)} />
            </div>
          </div>
        </div>
      )}

      <GenericButton
        unstyled={true}
        customStyling="absolute bottom-24 right-6 z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg 
                transition-transform duration-200 active:scale-90 hover:scale-110"
        onClick={() => {
          setShowCreateEvent(true)
        }}
      >
        <Add fontSize="large" />
      </GenericButton>
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
