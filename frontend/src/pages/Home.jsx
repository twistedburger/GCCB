import SearchBar from '../components/SearchBar'
import staticMap from '../assets/static-map.jpg'
import SliderCard from '../components/SliderCard'
import ArriveDepartToggle from '../components/ArriveDepartToggle'
import { PlaceOutlined } from '@mui/icons-material'
import { useState } from 'react'
import EventCard from '../components/EventCard'

function Home() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isArriving, setIsArriving] = useState(true)
  const [location, setLocation] = useState('')

  const handleSearch = newLocation => {
    setLocation(newLocation)
    setIsExpanded(true)
  }

  const dummyEvents = [
    {
      id: 1,
      title: 'BCIT Hackathon',
      location: 'BCIT Downtown Campus',
      date: '2026-03-10T02:30:00Z',
      description:
        '48 Hours. 200 Developers. Limitless Potential. Join a community of elite builders for an intense, two-day sprint to turn ideas into reality!',
      verified: true,
    },
    {
      id: 2,
      title: 'Group Study',
      location: 'BCIT Downtown Campus',
      date: '2026-02-01T17:30:00Z',
      description: 'Studying for the COMP 3800 final today, come join! :)',
      verified: false,
    },
    {
      id: 3,
      title: 'Football',
      location: 'Andy Livingstone Field',
      date: '2026-02-23T01:00:00Z',
      description:
        'Open to everyone, join us for some football games at Andy Livingstone!',
      verified: false,
    },
  ]
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
            {dummyEvents.map(item => (
              <EventCard key={item.id} event={item} />
            ))}
          </>
        )}
      </SliderCard>
    </div>
  )
}

export default Home
