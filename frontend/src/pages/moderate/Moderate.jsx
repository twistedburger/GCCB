import { useState, useEffect } from 'react'
import EventCard from '../../components/EventCard'
import RouteCard from '../../components/RouteCard'
import OrganizerCard from '../../components/OrganizerCard'
import GenericToggle from '../../components/GenericToggle'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../utils/Authorization'
import ModerationActions from './ModerationActions'

function Moderate() {
  const navigate = useNavigate()
  const [reportQueue, setReportQueue] = useState([])
  const [eventQueue, setEventQueue] = useState([])
  const [viewingReports, setViewingReports] = useState(true)
  const { authorization } = useAuth()

  useEffect(() => {
    const fetchReportQueue = async () => {
      const response = await fetch(`http://localhost:3000/api/reports`)
      const data = await response.json()
      setReportQueue(data)
    }

    const fetchPendingEvents = async () => {
      const response = await fetch(
        `http://localhost:3000/api/events?need_approval=true`
      )
      const data = await response.json()
      setEventQueue(data)
    }

    fetchReportQueue()
    fetchPendingEvents()
  }, [])

  return (
    <div className="px-6">
      <div className="flex justify-center mt-6 mb-4 *:w-full">
        <GenericToggle
          value={viewingReports}
          onChange={setViewingReports}
          labels={['Reports', 'Events']}
        />
      </div>

      {/* Pending reports */}
      {viewingReports && (
        <div className="flex flex-col gap-4">
          {reportQueue.map(report => (
            <div key={report.id}>
              {/* Event Report, click leads to event details */}
              {report.report_target == 'event' && (
                <div className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white overflow-hidden">
                  <div className="*:shadow-white">
                    <EventCard
                      event={report.target_details}
                      view={authorization}
                    />
                  </div>
                  <ModerationActions reportInformation={report} />
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
                  <ModerationActions reportInformation={report} />
                </div>
              )}

              {/* User Report, no click/no profile view yet? */}
              {report.report_target == 'user' && (
                <div className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white overflow-hidden">
                  <div className="*:shadow-white">
                    <OrganizerCard user={report.target_details} />
                  </div>
                  <ModerationActions reportInformation={report} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Events to be verified */}
      {!viewingReports &&
        eventQueue.map(event => (
          <div key={event.id}>
            <div className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white overflow-hidden">
              <div className="*:shadow-white">
                <EventCard event={event} view={authorization} />
              </div>
              <ModerationActions />
            </div>
          </div>
        ))}
    </div>
  )
}

export default Moderate
