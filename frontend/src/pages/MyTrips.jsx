import { useState, useEffect, useRef } from 'react'
import GenericToggle from '../components/GenericToggle'
import RouteCardWrapper from '../components/RouteCardWrapper'
import Modal from '../components/Modal'
import Report from '../components/Report'
import RouteCard from '../components/RouteCard'
import Alert from '../components/Alert'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { useUser } from '../../context/UserContext'
import { myTripsStrings } from '../locales/en/MyTripsStrings'
import {
  fetchMyTrips,
  confirmTripAction,
  confirmRouteRemoval,
  leaveRoute,
  getConfirmationTitle,
  getConfirmationBody,
  shouldHideReportJoin,
} from '../utils/MyTripsUtils'
import { useParams } from 'react-router-dom'
import HighlightCard from '../components/HighlightCard'

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
  const [reportData, setReportData] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [pendingAction, setPendingAction] = useState({ type: null, trip: null })
  const [alert, setAlert] = useState(null)
  const [confirmLeave, setConfirmLeave] = useState(null)
  const [isRouteRemovalDialogOpen, setIsRouteRemovalDialogOpen] =
    useState(false)
  const [routeIdToRemove, setRouteIdToRemove] = useState(null)
  const { user } = useUser()
  const { id } = useParams()
  const cardRefs = useRef({})

  useEffect(() => {
    if (!id) return

    if (cardRefs.current[parseInt(id)]) {
      cardRefs.current[parseInt(id)].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [id, activeTrips])

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
    fetchMyTrips(setActiveTrips, setCompletedTrips).catch(console.error)
  }, [])

  const tripsToDisplay = viewingActive ? activeTrips : completedTrips

  const handleRouteLeaveRequest = route => {
    const isRouteCreator = user?.id === route.creator_id

    if (isRouteCreator) {
      setRouteIdToRemove(route.id)
      setIsRouteRemovalDialogOpen(true)
    } else {
      setConfirmLeave(route)
    }
  }

  const handleConfirm = async () => {
    try {
      await confirmTripAction(
        pendingAction,
        setAlert,
        setActiveTrips,
        setCompletedTrips,
        setPendingAction
      )
    } catch (error) {
      console.error(error)
      setAlert({ message: myTripsStrings.actionError, type: 'error' })
    }
  }

  return (
    <div>
      <div className="fixed inset-y-0 right-0 left-13.75 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <ConfirmationDialog
            variant="danger"
            isOpen={isRouteRemovalDialogOpen}
            onClose={() => setIsRouteRemovalDialogOpen(false)}
            onConfirm={() =>
              confirmRouteRemoval(
                routeIdToRemove,
                setActiveTrips,
                setAlert,
                setIsRouteRemovalDialogOpen,
                setRouteIdToRemove
              )
            }
            title={myTripsStrings.deleteRoute}
          >
            {myTripsStrings.creatorLeave}
          </ConfirmationDialog>
          <ConfirmationDialog
            isOpen={confirmLeave !== null}
            onConfirm={() =>
              leaveRoute(
                confirmLeave,
                setActiveTrips,
                setCompletedTrips,
                setConfirmLeave
              )
            }
            onClose={() => setConfirmLeave(null)}
            title={myTripsStrings.leaveRoute}
            variant="primary"
          >
            {myTripsStrings.confirmationLeave}
          </ConfirmationDialog>
          <ConfirmationDialog
            isOpen={pendingAction.type !== null}
            onConfirm={handleConfirm}
            onClose={() => setPendingAction({ type: null, trip: null })}
            title={getConfirmationTitle(pendingAction.type)}
            variant="primary"
          >
            {getConfirmationBody(pendingAction.type)}
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
            labels={[myTripsStrings.activeTrips, myTripsStrings.completedTrips]}
          />
        </div>
        <div className="flex flex-col gap-4">
          {tripsToDisplay.map(trip => (
            <HighlightCard
              key={trip.id}
              ref={element => (cardRefs.current[trip.id] = element)}
              shouldFlash={trip.id === parseInt(id)}
            >
              <RouteCardWrapper
                route={trip}
                mapsReady={mapsReady}
                onReport={trip => {
                  setReportData(trip)
                  setShowReport(true)
                }}
                onComplete={() => setPendingAction({ type: 'complete', trip })}
                onIncomplete={() =>
                  setPendingAction({ type: 'incomplete', trip })
                }
              >
                <div className="*:shadow-white">
                  <RouteCard
                    route={trip}
                    individualView={true}
                    routeDetailView={true}
                    isCompleted={trip.completed}
                    onToggleJoin={() => handleRouteLeaveRequest(trip)}
                    onReport={data => {
                      setReportData(data)
                      setShowReport(true)
                    }}
                    hideReportJoin={shouldHideReportJoin(trip.depart_time)}
                  />
                </div>
              </RouteCardWrapper>
            </HighlightCard>
          ))}
        </div>
      </div>
      <div className="*:ml-13.75">
        <Modal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          title={myTripsStrings.reportTitle}
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
