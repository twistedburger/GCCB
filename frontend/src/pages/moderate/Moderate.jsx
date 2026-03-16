import { useState, useEffect } from 'react'
import EventCard from '../../components/EventCard'
import RouteCard from '../../components/RouteCard'
import GenericToggle from '../../components/GenericToggle'
import ModeratorCardWrapper from './ModeratorCardWrapper'

function Moderate() {
  const [reportQueue, setReportQueue] = useState([])
  const [eventQueue, setEventQueue] = useState([])
  const [viewingReports, setViewingReports] = useState(true)

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
              {/* Event Report */}
              {report.report_target == 'event' && (
                <ModeratorCardWrapper reportInformation={report}>
                  <div className="*:shadow-white">
                    <EventCard
                      event={report.target_details}
                      view={'moderate'}
                    />
                  </div>
                </ModeratorCardWrapper>
              )}
              {/* Route Report */}
              {report.report_target == 'route' && (
                <ModeratorCardWrapper reportInformation={report}>
                  <div className="*:shadow-white">
                    <RouteCard
                      route={report.target_details}
                      individualView={true}
                      view={'moderate'}
                    />
                  </div>
                </ModeratorCardWrapper>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Events to be verified */}
      {!viewingReports &&
        eventQueue.map(event => <div key={event.id}>{event.title}</div>)}
    </div>
  )
}

export default Moderate
