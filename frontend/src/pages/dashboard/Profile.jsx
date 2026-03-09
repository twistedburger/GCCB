import GenericButton from '../../components/GenericButton'
import PropTypes from 'prop-types'
import ProfileForm from '../../components/ProfileForm'
import { useState } from 'react'

const placeholderUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  nickname: 'J-Dough',
  role: 'user',
  description: 'Placeholder: Short bio/description goes here.',
  profileImageUrl: 'placeholder.jpg',
}

const placeholderStats = [
  { label: 'Total Trips', value: '32' },
  { label: 'CO₂ Saved', value: '21 kg' },
  { label: 'Distance Traveled', value: '123 km' },
  { label: 'Badges', value: '3 Badges' },
]

const placeholderActiveTrips = [
  { id: 1, title: 'Active Trip Placeholder', details: 'Mode - Route - Time' },
]

const placeholderUpcomingTrips = [
  {
    id: 1,
    title: 'Upcoming Trip Placeholder',
    details: 'Date - Mode - Location',
  },
  {
    id: 2,
    title: 'Upcoming Trip Placeholder',
    details: 'Date - Mode - Location',
  },
]

const placeholderBadges = [
  { id: 1, title: 'Badge Placeholder' },
  { id: 2, title: 'Badge Placeholder' },
  { id: 3, title: 'Badge Placeholder' },
]

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="text-lg font-semibold">{value}</div>
      <div className="mt-1 text-xs text-zinc-600">{label}</div>
    </div>
  )
}
StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
}

function ListItem({ title, details }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-xs text-zinc-600">{details}</div>
    </div>
  )
}
ListItem.propTypes = {
  title: PropTypes.string.isRequired,
  details: PropTypes.string.isRequired,
}

function Profile() {
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = formData => {
    console.log('Form submitted with data:', formData)
    //send PUT request to backend to update user info
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      {isEditing ? (
        <div>
          <ProfileForm
            user={placeholderUser}
            isNew={false}
            onSubmit={handleSubmit}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          {/* Top bar */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">My Account</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Welcome to your profile!
              </p>
            </div>

            {/* Logout */}
            <GenericButton
              onClick={() => {
                window.location.href = 'http://localhost:3000/logoutRoute'
              }}
              className="m-0"
            >
              Logout
            </GenericButton>
          </div>

          <div className="flex flex-col gap-4">
            {/* Profile header + stats */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start gap-4">
                <img
                  src={placeholderUser.profileImageUrl}
                  alt="Profile Image Goes Here"
                  className="h-24 w-24 rounded-full border border-zinc-200 object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <div className="text-xl font-semibold">
                      {placeholderUser.name}
                    </div>
                    <div className="text-sm text-zinc-600">
                      ({placeholderUser.nickname})
                    </div>
                  </div>

                  <div className="mt-1 text-l text-zinc-600">
                    {placeholderUser.role}
                  </div>

                  <div className="mt-3 text-sm text-zinc-700">
                    {placeholderUser.bio}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
                >
                  Edit Profile
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {placeholderStats.map(s => (
                  <StatCard key={s.label} label={s.label} value={s.value} />
                ))}
              </div>
            </div>

            {/* Active Trips */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <SectionHeader title="Active Trips" />
              <div className="flex flex-col gap-3">
                {placeholderActiveTrips.map(t => (
                  <ListItem key={t.id} title={t.title} details={t.details} />
                ))}
              </div>
            </div>

            {/* Commute History */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <SectionHeader
                title="Commute History"
                actionLabel="View"
                onAction={() => console.log('View history')}
              />
              <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
                Placeholder.
              </div>
            </div>

            {/* Upcoming Trips - Possibly move to dashboard & replace with event card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <SectionHeader
                title="Upcoming Trips"
                actionLabel="View all"
                onAction={() => console.log('View all upcoming')}
              />
              <div className="flex flex-col gap-3">
                {placeholderUpcomingTrips.map(t => (
                  <ListItem key={t.id} title={t.title} details={t.details} />
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <SectionHeader
                title="Badges"
                actionLabel="Manage"
                onAction={() => console.log('Manage badges')}
              />
              <div className="flex flex-wrap gap-2">
                {placeholderBadges.map(b => (
                  <span
                    key={b.id}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700"
                  >
                    {b.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Profile
