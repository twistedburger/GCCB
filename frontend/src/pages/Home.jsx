import SearchBar from '../components/SearchBar'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  Pin,
} from '@vis.gl/react-google-maps'
import SliderCard from '../components/SliderCard'
import ArriveDepartToggle from '../components/ArriveDepartToggle'
import { Add, Close, PlaceOutlined } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import RouteCard from '../components/RouteCard'
import PropTypes from 'prop-types'
import CreateEvent from '../components/CreateEvent'
import GenericButton from '../components/GenericButton'

function Home() {
  const [userLocation, setUserLocation] = useState({ lat: 49.28, lng: -123.12 })
  const [isExpanded, setIsExpanded] = useState(false)
  const [isArriving, setIsArriving] = useState(true)
  const [location, setLocation] = useState('')
  const [events, setEvents] = useState([])
  const [routes, setRoutes] = useState([])
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  const handleSearch = async newLocation => {
    setLocation(newLocation)
    setIsExpanded(true)

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
    // for display purposes, not everything will be displaying on home feed like this
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/events')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      }
    }

    const fetchRoutes = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/routes')
        const data = await response.json()
        setRoutes(data)
      } catch (error) {
        console.error('Error fetching routes:', error)
        setRoutes([])
      }
    }

    if (location) {
      fetchEvents()
      fetchRoutes()
    }
  }, [location])

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
          zoom={17}
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
      <SliderCard key={location} isExpanded={isExpanded}>
        {location && (
          <>
            <div className="flex items-center gap-2">
              <ArriveDepartToggle
                isArriving={isArriving}
                setIsArriving={setIsArriving}
                className="shrink-0"
              />
              <span className="text-text-secondary truncate text-sm">
                <PlaceOutlined className="mr-1" />
                {location}
              </span>
            </div>
            {events.map(item => (
              <EventCard key={item.id} event={item} />
            ))}
            {events.map(item => (
              <EventCard key={item.id} event={item} view={'moderate'} />
            ))}
            {routes.map(item => (
              <RouteCard key={item.id} route={item} individualView={true} />
            ))}
            {routes.map(item => (
              <RouteCard key={item.id} route={item} individualView={false} />
            ))}
          </>
        )}
      </SliderCard>

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
            className={`relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out
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
            <div className="p-8">
              <CreateEvent onSuccess={() => setShowCreateEvent(false)} />
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
