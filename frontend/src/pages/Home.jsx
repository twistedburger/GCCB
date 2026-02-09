import SearchBar from '../components/SearchBar'
import staticMap from '../assets/static-map.jpg'
import SliderCard from '../components/SliderCard'
import EventCard from '../components/EventCard'

function Home() {
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
      <SearchBar />
      <SliderCard>
        {dummyEvents.map(item => (
          <EventCard key={item.id} event={item} />
        ))}
      </SliderCard>
    </div>
  )
}

export default Home
