import { useState, useEffect } from 'react'
import GenericToggle from '../components/GenericToggle'
import RouteCardWrapper from '../components/RouteCardWrapper'
import Modal from '../components/Modal'
import Report from '../components/Report'
import RouteCard from '../components/RouteCard'
import Alert from '../components/Alert'
import ConfirmationDialog from '../components/ConfirmationDialog'

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
  const baseURL = import.meta.env.VITE_API_BASE_URL

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
      const response = await fetch(`${baseURL}/api/my-trips`, {
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const tripsToDisplay = viewingActive ? activeTrips : completedTrips

  const handleLeave = async () => {
    await fetch(`${baseURL}/api/routes/${confirmLeave.id}/leave`, {
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
      {alert && (
        <Alert
          message={alert.text}
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
                  onToggleJoin={() => setConfirmLeave(trip)}
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
      <Modal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        title={'Report Route'}
      >
        <Report
          type={'route'}
          targetId={reportData?.id}
          onClose={() => setShowReport(false)}
          setAlert={reportAlert => {
            if (!reportAlert?.type) return
            setAlert({
              type: reportAlert.type,
              text:
                reportAlert.type === 'success'
                  ? 'Report submitted successfully.'
                  : 'Failed to submit report.',
            })
          }}
        />
      </Modal>
    </div>
  )
}
