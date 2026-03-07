// TODO: Things to include -- Settings, maybe user guide
import GenericButton from '../../components/GenericButton'
import PropTypes from 'prop-types'
import ProfileForm from '../../components/ProfileForm'
import { useAuth } from '../../utils/Authorization'
import DashboardMetricCard from '../../components/DashboardMetricCard'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  formatKg,
  formatKm,
  getMostUsedMode,
} from '../../utils/analyticsHelpers'

function ProfileHeader({ user, onEdit }) {
  const displayName = user?.name ?? 'Unknown User'
  const displayNickname = user?.nickname ?? 'No nickname'
  const displayRole = user?.role ?? 'user'
  const displayDescription =
    user?.description ?? 'No profile description added yet.'

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-sm text-zinc-500">
          No Image
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <div className="text-xl font-semibold">{displayName}</div>
            <div className="text-sm text-zinc-600">({displayNickname})</div>
          </div>

          <div className="mt-1 text-base text-zinc-600">{displayRole}</div>

          <div className="mt-3 text-sm text-zinc-700">{displayDescription}</div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
        >
          Edit Profile
        </button>
      </div>
    </div>
  )
}

ProfileHeader.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    nickname: PropTypes.string,
    role: PropTypes.string,
    description: PropTypes.string,
  }),
  onEdit: PropTypes.func.isRequired,
}

function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const { deauthorizeUser } = useAuth()

  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [userError, setUserError] = useState('')

  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [summaryError, setSummaryError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoadingUser(true)
        setUserError('')

        const response = await fetch('http://localhost:3000/authenticateUser', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`)
        }

        const data = await response.json()

        if (!data.isAuthenticated) {
          setUserError('User is not authenticated.')
          setUser(null)
          return
        }

        if (!data.user) {
          setUserError('Authenticated user was not found in the database.')
          setUser(null)
          return
        }

        setUser(data.user)
      } catch (error) {
        console.error('Failed to load user', error)
        setUserError('Failed to load user profile.')
      } finally {
        setLoadingUser(false)
      }
    }

    async function fetchSummary() {
      try {
        setLoadingSummary(true)
        setSummaryError('')

        const response = await fetch(
          'http://localhost:3000/api/analytics/summary',
          {
            credentials: 'include',
          }
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch analytics summary: ${response.status}`
          )
        }

        const data = await response.json()
        setSummary(data)
      } catch (error) {
        console.error('Failed to load analytics summary', error)
        setSummaryError('Failed to load analytics summary.')
      } finally {
        setLoadingSummary(false)
      }
    }

    fetchUser()
    fetchSummary()
  }, [])

  const handleSubmit = formData => {
    console.log('Form submitted with data:', formData)
    // TODO: send PUT request to backend to update user info
  }

  const isAdmin = user?.role === 'admin'

  const totalTripsValue = loadingSummary ? '...' : `${summary?.tripCount ?? 0}`

  const totalTripsSubtitle = loadingSummary
    ? 'Loading...'
    : isAdmin
      ? `${formatKm(summary?.totalDistanceKm)} across completed routes`
      : `${formatKm(summary?.totalDistanceKm)} traveled`

  const co2Value = loadingSummary ? '...' : formatKg(summary?.totalCo2SavedKg)

  const mostUsedModeValue = loadingSummary
    ? '...'
    : getMostUsedMode(summary?.tripFrequenciesByMode)

  const mostUsedModeSubtitle = loadingSummary
    ? 'Loading...'
    : `Across ${summary?.tripCount ?? 0} trips`

  const metricCards = isAdmin
    ? [
        {
          title: 'Total User Trips',
          value: totalTripsValue,
          subtitle: totalTripsSubtitle,
          onClick: () => navigate('/dashboard/analytics/trip-frequency'),
        },
        {
          title: 'Total CO₂e Saved',
          value: co2Value,
          subtitle: 'Estimated from completed trips',
          onClick: () => navigate('/dashboard/analytics/co2-savings'),
        },
        {
          title: 'Average Group Size',
          value: 'Coming soon',
          subtitle: 'Planned admin metric',
          onClick: () =>
            console.log('Placeholder: Average group size page later'),
        },
      ]
    : [
        {
          title: 'Total Trips',
          value: totalTripsValue,
          subtitle: totalTripsSubtitle,
          onClick: () => navigate('/dashboard/analytics/commutes'),
        },
        {
          title: 'Personal CO₂ Saved',
          value: co2Value,
          subtitle: 'From completed trips',
          onClick: () => navigate('/dashboard/analytics/co2-savings'),
        },
        {
          title: 'Most Used Mode',
          value: mostUsedModeValue,
          subtitle: mostUsedModeSubtitle,
          onClick: () => navigate('/dashboard/analytics/trip-frequency'),
        },
        {
          title: 'Badges',
          value: '0',
          subtitle: 'Coming soonTM',
          onClick: () => console.log('Placeholder: Badges page later'),
        },
      ]

  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      {isEditing ? (
        <ProfileForm
          user={user}
          isNew={false}
          onSubmit={handleSubmit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">My Account</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Welcome to your dashboard!
              </p>
            </div>

            <GenericButton
              onClick={async () => {
                await deauthorizeUser()
                window.location.href = 'http://localhost:3000/logoutRoute'
              }}
              className="m-0"
            >
              Logout
            </GenericButton>
          </div>

          <div className="flex flex-col gap-4">
            {userError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {userError}
              </div>
            ) : loadingUser ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                Loading profile...
              </div>
            ) : (
              <ProfileHeader user={user} onEdit={() => setIsEditing(true)} />
            )}

            {summaryError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {summaryError}
              </div>
            ) : null}

            <div
              className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
                isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
              }`}
            >
              {metricCards.map(card => (
                <DashboardMetricCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  subtitle={card.subtitle}
                  onClick={card.onClick}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Profile
