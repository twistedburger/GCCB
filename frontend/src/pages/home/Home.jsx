import SearchBar from '../../components/SearchBar'
import staticMap from '../../assets/static-map.jpg'
import SliderCard from '../../components/SliderCard'
import GenericToggle from '../../components/GenericToggle'
import { PlaceOutlined, TuneOutlined } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import EventCard from '../../components/EventCard'
import RouteCard from '../../components/RouteCard'
import { useNavigate, useLocation } from 'react-router-dom'

function Home() {
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

  const handleSearch = newLocation => {
    setAddress(newLocation)
    setIsExpanded(true)
    setFilters({
      time: null,
      transportationModes: [],
      radius: 100,
      verifiedEventsOnly: false,
      mainEventsOnly: true,
    })
  }

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
  }, [location, filters])

  useEffect(() => {
    if (location.state?.filters) {
      setFilters(location.state.filters)
    }
  }, [location.state])

  return (
    <div className="relative w-full h-full">
      <img src={staticMap} className="absolute w-full h-full object-cover" />
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
    </div>
  )
}

export default Home
