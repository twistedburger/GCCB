import SearchBar from '../../components/SearchBar'
import staticMap from '../../assets/static-map.jpg'
import SliderCard from '../../components/SliderCard'
import GenericToggle from '../../components/GenericToggle'
import { PlaceOutlined, TuneOutlined } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import EventCard from '../../components/EventCard'
import RouteCard from '../../components/RouteCard'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isArriving, setIsArriving] = useState(true)
  const [location, setLocation] = useState('')
  const [events, setEvents] = useState([])
  const [routes, setRoutes] = useState([])
  const navigate = useNavigate()

  const handleSearch = newLocation => {
    setLocation(newLocation)
    setIsExpanded(true)
  }

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

  return (
    <div className="relative w-full h-full">
      <img src={staticMap} className="absolute w-full h-full object-cover" />
      <SearchBar onSearch={handleSearch} />
      <SliderCard key={location} isExpanded={isExpanded}>
        {location && (
          <>
            <div className="flex items-center gap-2">
              <TuneOutlined
                className="text-text-primary"
                onClick={() => {
                  navigate('/filter')
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

export default Home
