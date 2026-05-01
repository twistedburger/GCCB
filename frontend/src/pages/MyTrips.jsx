import { useState, useEffect } from 'react'
import GenericToggle from '../components/GenericToggle'
import RouteCardWrapper from '../components/RouteCardWrapper'
import Modal from '../components/Modal'
import Report from '../components/Report'
import RouteCard from '../components/RouteCard'
import Alert from '../components/Alert'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { useUser } from '../../context/UserContext'

/**
 * Display the MyTrips page
 *
 * @returns {JSX.Element}
 */
export default function MyTrips() {
  const [activeTrips, setActiveTrips] = useState([])
  const [completedTrips, setCompletedTrips] = useState([])
  const [viewingActive, setViewingActive] = useState(true)
  const [mapsReady, setMapsReady] = useState(!!window.google?.maps)
  const [confirmLeave, setConfirmLeave] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [alert, setAlert] = useState(null)
  const { user } = useUser()
  const [isRouteRemovalDialogOpen, setIsRouteRemovalDialogOpen] =
    useState(false)
  const [routeIdToRemove, setRouteIdToRemove] = useState(null)

  const handleRouteLeaveRequest = route => {
    const isRouteCreator = user?.id === route.creator_id

    if (isRouteCreator) {
      setRouteIdToRemove(route.id)
      setIsRouteRemovalDialogOpen(true)
    } else {
      setConfirmLeave(route)
    }
  }

  const handleConfirmRouteRemoval = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/routes/${routeIdToRemove}/delete`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (response.ok) {
        setActiveTrips(prev => prev.filter(trip => trip.id !== routeIdToRemove))
        setAlert({ type: 'success', text: 'Route deleted.' })
      }
    } catch (error) {
      setAlert({ type: 'error', text: `Delete failed. ${error.message}` })
    } finally {
      setIsRouteRemovalDialogOpen(false)
      setRouteIdToRemove(null)
    }
  }

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

  const tripsToDisplay = viewingActive ? activeTrips : completedTrips

  const handleLeave = async () => {
    await fetch(`http://localhost:3000/api/routes/${confirmLeave.id}/leave`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await fetchMyTrips()
    setConfirmLeave(null)
  }

  useEffect(() => {
    fetchMyTrips()
  }, [])

  return (
    <div>
      <div className="fixed inset-y-0 right-0 left-[55px] z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <ConfirmationDialog
            variant="danger"
            isOpen={isRouteRemovalDialogOpen}
            onClose={() => setIsRouteRemovalDialogOpen(false)}
            onConfirm={handleConfirmRouteRemoval}
            title="Delete Route?"
          >
            As the creator of this route, leaving will delete it for everyone
            currently joined. Are you sure?
          </ConfirmationDialog>
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
      </div>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onTimeout={() => setAlert(null)}
        />
      )}
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
                  routeDetailView={true}
                  isCompleted={trip.completed}
                  onToggleJoin={() => handleRouteLeaveRequest(trip)}
                  onReport={trip => {
                    {
                      setReportData(trip)
                      setShowReport(true)
                    }
                  }}
                />
              </div>
            </RouteCardWrapper>
          ))}
        </div>
      </div>
      <div className="*:ml-13.75">
        <Modal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          title={'Report Route'}
        >
          {reportData && (
            <Report
              type={'route'}
              targetId={reportData?.targetId}
              onClose={() => setShowReport(false)}
              setAlert={setAlert}
            />
          )}
        </Modal>
      </div>
    </div>
  )
}
