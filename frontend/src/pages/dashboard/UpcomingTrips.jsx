import EventCard from '../../components/EventCard'

const placeholderTrips = []

function UpcomingTrips() {
  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Upcoming Trips</h1>
        <p className="text-sm text-text-secondary">
          These are your scheduled trips:
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {placeholderTrips.map(trip => (
          <EventCard key={trip.id} event={trip} />
        ))}
      </div>
    </div>
  )
}
export default UpcomingTrips
