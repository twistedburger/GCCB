import SearchBar from '../components/SearchBar'
import staticMap from '../assets/static-map.jpg'
import SliderCard from '../components/SliderCard'
import ArriveDepartToggle from '../components/ArriveDepartToggle'
import { PlaceOutlined } from '@mui/icons-material'
import { useState } from 'react'

function Home() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isArriving, setIsArriving] = useState(true)
  const [location, setLocation] = useState('')

  const handleSearch = newLocation => {
    setLocation(newLocation)
    setIsExpanded(true)
  }

  return (
    <div className="relative w-full h-full">
      <img src={staticMap} className="absolute w-full h-full object-cover" />
      <SearchBar onSearch={handleSearch} />
      <SliderCard key={location} isExpanded={isExpanded}>
        {location && (
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
        )}
      </SliderCard>
    </div>
  )
}

export default Home
