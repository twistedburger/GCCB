import SearchBar from '../components/SearchBar'
import staticMap from '../assets/static-map.jpg'
import SliderCard from '../components/SliderCard'
import ArriveDepartToggle from '../components/ArriveDepartToggle'
import { PlaceOutlined } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import RouteCard from '../components/RouteCard'

function Home() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isArriving, setIsArriving] = useState(true)
  const [location, setLocation] = useState('')
  const [events, setEvents] = useState([])
  const [routes, setRoutes] = useState([])

  const handleSearch = newLocation => {
    setLocation(newLocation)
    setIsExpanded(true)
  }

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      }
    }

    const fetchRoutes = async () => {
      try {
        const response = await fetch('/api/routes')
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

  return (
    <div className="relative w-full h-full">
      <img src={staticMap} className="absolute w-full h-full object-cover" />
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
            {routes.map(item => (
              <RouteCard key={item.id} route={item} />
            ))}
          </>
        )}
      </SliderCard>
    </div>
  )
}

export default Home
