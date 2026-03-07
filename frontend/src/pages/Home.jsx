import SearchBar from '../components/SearchBar'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  Pin,
} from '@vis.gl/react-google-maps'
import SliderCard from '../components/SliderCard'
import GenericToggle from '../components/GenericToggle'
import { PlaceOutlined, TuneOutlined } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import RouteCard from '../components/RouteCard'
import PropTypes from 'prop-types'
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
      <SearchBar onSearch={handleSearch} />
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
