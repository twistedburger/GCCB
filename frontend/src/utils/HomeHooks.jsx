import { useCallback, useState } from 'react'

export function useLocationSearch() {
  const [searchedLocationResult, setUserLocation] = useState(null)
  const [searchAddress, setAddress] = useState('')
  const handleSearch = useCallback(async newLocation => {
    setAddress(newLocation)
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
  }, [])
  const clearSearch = () => setAddress('')

  return { searchedLocationResult, searchAddress, handleSearch, clearSearch }
}
