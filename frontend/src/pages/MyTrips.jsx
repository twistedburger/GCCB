import { useState, useEffect } from 'react'
import GenericToggle from '../components/GenericToggle'
import RouteCardWrapper from '../components/RouteCardWrapper'
import RouteCard from '../components/RouteCard'

export default function MyTrips() {
  const [activeTrips, setActiveTrips] = useState([])
  const [completedTrips, setCompletedTrips] = useState([])
  const [viewingActive, setViewingActive] = useState(true)
  const [mapsReady, setMapsReady] = useState(!!window.google?.maps)

  useEffect(() => {
    if (window.google?.maps) {
      setMapsReady(true)
      return
    }
    const interval = setInterval(() => {
      if (window.google?.maps) {
        setMapsReady(true)
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchMyTrips = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/my-trips`, {
          credentials: 'include',
        })
        const data = await response.json()
        if (!Array.isArray(data)) return

        const now = new Date()
        setActiveTrips(data.filter(trip => new Date(trip.depart_time) > now))
        setCompletedTrips(
          data.filter(trip => new Date(trip.depart_time) <= now)
        )
      } catch (err) {
        console.error('Fetch error:', err)
      }
    }
    fetchMyTrips()
  }, [])

  const tripsToDisplay = viewingActive ? activeTrips : completedTrips

  return (
    <div className="px-6 pb-20 relative">
      <div className="flex justify-center mt-6 mb-6 *:w-full">
        <GenericToggle
          value={viewingActive}
          onChange={setViewingActive}
          labels={['Active Trips', 'Completed Trips']}
        />
      </div>

      <div className="flex flex-col gap-4">
        {tripsToDisplay.map(trip => (
          <RouteCardWrapper key={trip.id} route={trip} mapsReady={mapsReady}>
            <div className="*:shadow-white">
              <RouteCard route={trip} individualView={true} />
            </div>
          </RouteCardWrapper>
        ))}
      </div>
    </div>
  )
}
