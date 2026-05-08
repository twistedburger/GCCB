import GenericButton from '../components/GenericButton'
import PropTypes from 'prop-types'
import ProfileForm from '../components/ProfileForm'
import DashboardMetricCard from '../components/DashboardMetricCard'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  formatKg,
  formatKm,
  getMostUsedMode,
} from '../utils/AnalyticsHelpers.js'
import { useUser } from '../../context/UserContext.jsx'
import { analyticsStrings } from '../locales/en/AnalyticsStrings'
import ProfileInfo from '../components/ProfileInfo'

const dashboardStrings = analyticsStrings.dashboard

/**
 * Component for the profile header.
 *
 * @param {Object} user Current user
 * @param {func} onEdit Callback function for when edit button is clicked
 * @returns {JSX.Element}
 */
function ProfileHeader({ user, onEdit }) {
  const navigate = useNavigate()

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start gap-4">
        <ProfileInfo
          user={user}
          actions={
            <div className="flex flex-col gap-1">
              <GenericButton
                onClick={onEdit}
                unstyled={true}
                customStyling="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
              >
                {dashboardStrings.profile.editProfile}
              </GenericButton>
              <GenericButton
                onClick={() => navigate('/bannedusers')}
                unstyled={true}
                customStyling="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
              >
                {dashboardStrings.profile.blockedUsers}
              </GenericButton>
            </div>
          }
        ></ProfileInfo>
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

/**
 * Dashboard page
 *
 * @returns {JSX.Element}
 */
function Dashboard() {
  const [isEditing, setIsEditing] = useState(false)

  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [summaryError, setSummaryError] = useState('')

  const { user, loadingUser, userError, setUser } = useUser()
  const navigate = useNavigate()
  const baseURL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoadingSummary(true)
        setSummaryError('')

        const response = await fetch(`${baseURL}/api/analytics/summary`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(
            `Failed to fetch analytics summary: ${response.status}`
          )
        }

        const analyticsSummary = await response.json()
        setSummary(analyticsSummary)
      } catch (error) {
        console.error('Failed to load analytics summary', error)
        setSummaryError(dashboardStrings.error.summary)
      } finally {
        setLoadingSummary(false)
      }
    }

    fetchSummary()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async formData => {
    const updateResponse = await fetch(`${baseURL}/updateProfile`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    const updatedUserData = await updateResponse.json()
    setUser(updatedUserData.user)
    setIsEditing(false)
  }

  const isAdmin = user?.role === 'admin'

  const totalTripsValue = loadingSummary ? '...' : `${summary?.tripCount ?? 0}`

  const totalTripsSubtitle = loadingSummary
    ? analyticsStrings.common.loading
    : isAdmin
      ? dashboardStrings.metrics.admin.totalTrips.subtitle(
          formatKm(summary?.totalDistanceKm)
        )
      : dashboardStrings.metrics.user.totalTrips.subtitle(
          formatKm(summary?.totalDistanceKm)
        )

  const co2Value = loadingSummary ? '...' : formatKg(summary?.totalCo2SavedKg)

  const mostUsedModeValue = loadingSummary
    ? '...'
    : getMostUsedMode(summary?.tripFrequenciesByMode)

  const mostUsedModeSubtitle = loadingSummary
    ? analyticsStrings.common.loading
    : dashboardStrings.metrics.user.mode.subtitle(summary?.tripCount ?? 0)

  const metricCards = isAdmin
    ? [
        {
          title: dashboardStrings.metrics.admin.totalTrips.title,
          value: totalTripsValue,
          subtitle: totalTripsSubtitle,
          onClick: () => navigate('/dashboard/trip-frequency'),
        },
        {
          title: dashboardStrings.metrics.admin.co2.title,
          value: co2Value,
          subtitle: dashboardStrings.metrics.admin.co2.subtitle,
          onClick: () => navigate('/dashboard/co2-savings'),
        },
        {
          title: dashboardStrings.metrics.admin.activity.title,
          value: dashboardStrings.metrics.admin.activity.value,
          subtitle: dashboardStrings.metrics.admin.activity.subtitle,
          onClick: () => navigate('/dashboard/activity'),
        },
      ]
    : [
        {
          title: dashboardStrings.metrics.user.totalTrips.title,
          value: totalTripsValue,
          subtitle: totalTripsSubtitle,
          onClick: () => navigate('/dashboard/commutes'),
        },
        {
          title: dashboardStrings.metrics.user.co2.title,
          value: co2Value,
          subtitle: dashboardStrings.metrics.user.co2.subtitle,
          onClick: () => navigate('/dashboard/co2-savings'),
        },
        {
          title: dashboardStrings.metrics.user.mode.title,
          value: mostUsedModeValue,
          subtitle: mostUsedModeSubtitle,
          onClick: () => navigate('/dashboard/trip-frequency'),
        },
        {
          title: dashboardStrings.metrics.user.badges.title,
          value: '0',
          subtitle: 'Coming soonTM',
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
              <h1 className="text-xl font-semibold">
                {dashboardStrings.title}
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                {dashboardStrings.welcome}
              </p>
            </div>

            <GenericButton
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_API_BASE_URL}/logoutRoute`
              }}
            >
              {dashboardStrings.logout}
            </GenericButton>
          </div>

          <div className="flex flex-col gap-4">
            {userError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {userError}
              </div>
            ) : loadingUser ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                {dashboardStrings.loadingProfile}
              </div>
            ) : (
              <ProfileHeader user={user} onEdit={() => setIsEditing(true)} />
            )}

            {summaryError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {summaryError}
              </div>
            ) : null}

            <p className="text-sm text-zinc-500">
              {dashboardStrings.metricCardsHint}
            </p>

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

export default Dashboard
