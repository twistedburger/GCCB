import React, { useState, useEffect } from 'react'
import EventCard from '../../components/EventCard'
import RouteCard from '../../components/RouteCard'
import OrganizerCard from '../../components/OrganizerCard'
// Disable verification for now.
// import GenericToggle from '../../components/GenericToggle'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../utils/Authorization'
import ModerationActions from './ModerationActions'
import Alert from '../../components/Alert'

function Moderate() {
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const [reportQueue, setReportQueue] = useState([])
  // Disable verification for now.
  // const [eventQueue, setEventQueue] = useState([])
  // const [viewingReports, setViewingReports] = useState(true)
  const [viewingReports] = useState(true)
  const { authorization } = useAuth()

  const fetchReportQueue = async () => {
    const response = await fetch(`http://localhost:3000/api/reports`)
    const data = await response.json()
    setReportQueue(data)
  }

  // Disable verification for now.
  // const fetchPendingEvents = async () => {
  //   const response = await fetch(
  //     `http://localhost:3000/api/pendingVerifications`
  //   )
  //   const data = await response.json()
  //   setEventQueue(data)
  // }

  useEffect(() => {
    fetchReportQueue()
    // Disable verification for now.
    // fetchPendingEvents()
  }, [])

  return (
    <div className="px-6 pt-6">
      {alert && (
        <Alert
          message={alert.text}
          type={alert.type}
          onTimeout={() => setAlert(null)}
        />
      )}
      <p className="text-[23px] text-text-primary font-medium">
        Pending Reports
      </p>
      {/* Disable verification for now */}
      {/* <div className="flex justify-center mt-6 mb-4 *:w-full">
        <GenericToggle
          value={viewingReports}
          onChange={setViewingReports}
          labels={['Reports', 'Events']}
        />
      </div> */}

      {/* Pending reports */}
      {viewingReports && (
        <div className="flex flex-col gap-4 mt-4 mb-4">
          {reportQueue.map(report => (
            <React.Fragment key={report.id}>
              {/* Event Report, click leads to event details */}
              {report.report_target == 'event' && (
                <div className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white overflow-hidden">
                  <div className="*:shadow-white">
                    <EventCard
                      event={report.target_details}
                      view={authorization}
                    />
                  </div>
                  <ModerationActions
                    information={report}
                    onSuccess={fetchReportQueue}
                    setAlert={setAlert}
                    mode={'report'}
                  />
                </div>
              )}

              {/* Route Report, click leads to event details */}
              {report.report_target == 'route' && (
                <div className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white overflow-hidden">
                  <div className="*:shadow-white">
                    <RouteCard
                      route={report.target_details}
                      view={authorization}
                      individualView={true}
                      onSelect={() => {
                        navigate(`/event/${report.target_details.event_id}`)
                      }}
                    />
                  </div>
                  <ModerationActions
                    information={report}
                    onSuccess={fetchReportQueue}
                    setAlert={setAlert}
                    mode={'report'}
                  />
                </div>
              )}

              {/* User Report, no click/no profile view yet? */}
              {report.report_target == 'user' && (
                <div className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white overflow-hidden">
                  <div className="*:shadow-white">
                    <OrganizerCard user={report.target_details} />
                  </div>
                  <ModerationActions
                    information={report}
                    onSuccess={fetchReportQueue}
                    setAlert={setAlert}
                    mode={'report'}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Events to be verified, disabled for now. */}
      {/* {!viewingReports &&
        eventQueue.map(event => (
          <div key={event.id}>
            <div className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white overflow-hidden">
              <div className="*:shadow-white">
                <EventCard event={event} view={authorization} />
              </div>
              <div className="-mt-4">
                <ModerationActions
                  information={event.id}
                  onSuccess={fetchPendingEvents}
                  setAlert={setAlert}
                  mode={'event'}
                />
              </div>
            </div>
          </div>
        ))} */}
    </div>
  )
}

export default Moderate
