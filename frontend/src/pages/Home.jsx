import SearchBar from '../components/SearchBar'
import staticMap from '../assets/static-map.jpg'
import SliderCard from '../components/SliderCard'

function Home() {
  return (
    <div className="relative w-full h-full">
      <img src={staticMap} className="absolute w-full h-full object-cover" />
      <SearchBar />
      <SliderCard />
    </div>
  )
}

export default Home
