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
import { PlaceOutlined } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import RouteCard from '../components/RouteCard'
import PropTypes from 'prop-types'
import { TravelMode, calculateRoute } from '../utils/routes'
import { useAuth } from '../utils/Authorization'

function Home() {
  const [userLocation, setUserLocation] = useState({ lat: 49.28, lng: -123.12 })
  const [isExpanded, setIsExpanded] = useState(false)
  const [isArriving, setIsArriving] = useState(true)
  const [location, setLocation] = useState('')
  const [events, setEvents] = useState([])
  const [routes, setRoutes] = useState([])
  const [routeLine, setRouteLine] = useState('')
  const { authorizeUser } = useAuth()
  authorizeUser()

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

    const getrouteLine = async () => {
      const route = await calculateRoute(
        { address: 'Waterfront Station, Vancouver' },
        { address: 'Science World, Vancouver' },
        TravelMode.Transit
      )
      setRouteLine(route.polyline.encodedPolyline)
      console.log(JSON.stringify(route))
    }

    getrouteLine()

    if (location) {
      fetchEvents()
      fetchRoutes()
    }
  }, [location])

  return (
    <div className="relative w-full h-full">
      <APIProvider
        apiKey=""
        scriptUrl="http://localhost:3000/maps/api/js"
        libraries={['geometry']}
      >
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
          <MapController center={userLocation} routeLine={routeLine} />
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
    </div>
  )
}

function MapController({ center, routeLine }) {
  const map = useMap()
  useEffect(() => {
    if (map && center) {
      map.panTo(center)
    }
  }, [map, center])

  useEffect(() => {
    if (!map || !routeLine) return

    const decodedPath = google.maps.geometry.encoding.decodePath(routeLine)
    const polyline = new google.maps.Polyline({
      path: decodedPath,
      geodesic: true,
      strokeColor: '#4285F4',
      strokeOpacity: 1.0,
      strokeWeight: 10,
      map,
    })

    const bounds = new google.maps.LatLngBounds()
    decodedPath.forEach(point => bounds.extend(point))
    map.fitBounds(bounds)

    return () => polyline.setMap(null)
  }, [map, routeLine])

  return null
}

MapController.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  routeLine: PropTypes.string,
}

export default Home
