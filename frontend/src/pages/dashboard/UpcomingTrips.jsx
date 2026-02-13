import EventCard from '../../components/EventCard'

const placeholderTrips = [
  {
    id: 1,
    title: 'BCIT Tech Mixer',
    creator_id: 3,
    event_time: '2026-04-10 17:30:00',
    location: '555 Seymour St, Vancouver, BC V6B 3H6',
    verified: true,
    need_approval: false,
    description: 'Networking for computing students.',
  },
  {
    id: 2,
    title: 'Earth Day Clean-up',
    creator_id: 2,
    event_time: '2026-04-22 09:00:00',
    location: 'Science World',
    verified: true,
    need_approval: true,
    description: 'Join us for a morning of eco-action!',
  },
  {
    id: 3,
    title: 'Late Night Hackathon',
    creator_id: 1,
    event_time: '2026-05-15 20:00:00',
    location: 'BCIT Burnaby Campus',
    verified: false,
    need_approval: false,
    description: 'Coding until the sun comes up.',
  },
]

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
