import SearchBar from '../components/SearchBar'
import staticMap from '../assets/static-map.jpg'

function Home() {
  return (
    <div>
      <img src={staticMap} className="absolute w-full h-full object-cover" />{' '}
      {/*image takes long to load, just set src to empty string if not needed*/}
      <SearchBar />
    </div>
  )
}

export default Home
