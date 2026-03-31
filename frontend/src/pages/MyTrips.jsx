import { useState, useEffect } from 'react'
import GenericToggle from '../components/GenericToggle'
import RouteCardWrapper from '../components/RouteCardWrapper'
import RouteCard from '../components/RouteCard'
import ConfirmationDialog from '../components/ConfirmationDialog'

export default function MyTrips() {
  const [activeTrips, setActiveTrips] = useState([])
  const [completedTrips, setCompletedTrips] = useState([])
  const [viewingActive, setViewingActive] = useState(true)
  const [mapsReady, setMapsReady] = useState(!!window.google?.maps)
  const [confirmLeave, setConfirmLeave] = useState(null)

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

  const fetchMyTrips = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/my-trips`, {
        credentials: 'include',
      })
      const data = await response.json()
      if (!Array.isArray(data)) return

      setActiveTrips(data.filter(trip => !trip.completed))
      setCompletedTrips(data.filter(trip => trip.completed))
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  useEffect(() => {
    fetchMyTrips()
  }, [])

  const tripsToDisplay = viewingActive ? activeTrips : completedTrips

  const handleLeave = async () => {
    await fetch(`http://localhost:3000/api/routes/${confirmLeave.id}/leave`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await fetchMyTrips()
    setConfirmLeave(null)
  }

  return (
    <div>
      <div className="*:ml-13.75">
        <ConfirmationDialog
          isOpen={confirmLeave !== null}
          onConfirm={handleLeave}
          onClose={() => setConfirmLeave(null)}
          title="Leave Route"
          confirmText={'OK'}
          cancelText={'Cancel'}
          variant="primary"
        >
          Are you sure you want to leave this route?
        </ConfirmationDialog>
      </div>
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
                <RouteCard
                  route={trip}
                  individualView={true}
                  isCompleted={trip.completed}
                  onToggleJoin={() => setConfirmLeave(trip)}
                />
              </div>
            </RouteCardWrapper>
          ))}
        </div>
      </div>
    </div>
  )
}
