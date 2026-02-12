import { adminAnalyticsEn } from '../../locales/adminAnalytics.en'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

function MetricCard({ title, value, actionLabel, onAction }) {
  return (
    <>
      <p>
        <strong>{title}</strong>
      </p>
      <div>{value}</div>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      <hr />
    </>
  )
}

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
}

function MetricsDisplay({ metrics }) {
  return (
    <>
      {metrics.map(m => (
        <MetricCard
          key={m.title}
          title={m.title}
          value={m.value}
          actionLabel={m.actionLabel}
          onAction={m.onAction}
        />
      ))}
    </>
  )
}

MetricsDisplay.propTypes = {
  metrics: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.node.isRequired,
      actionLabel: PropTypes.string,
      onAction: PropTypes.func,
    })
  ).isRequired,
}

function Analytics() {
  const [role, setRole] = useState('student') // "student" || "admin"
  const navigate = useNavigate()

  const goTo = path => navigate(path, { state: { role } })

  return (
    <>
      <h1>{adminAnalyticsEn.analyticsHub.title}</h1>
      <p>
        {adminAnalyticsEn.analyticsHub.currentRoleLabel} <strong>{role}</strong>
      </p>
      {/* Temporary: role toggle for UI testing; route via Auth/Permissions */}
      <button type="button" onClick={() => setRole('student')}>
        {adminAnalyticsEn.analyticsHub.viewAsStudent}
      </button>{' '}
      <br />
      <button type="button" onClick={() => setRole('admin')}>
        {adminAnalyticsEn.analyticsHub.viewAsAdmin}
      </button>
      <hr />
      {role === 'admin' ? (
        <AdminAnalytics goTo={goTo} />
      ) : (
        <StudentAnalytics goTo={goTo} />
      )}
    </>
  )
}

function AdminAnalytics({ goTo }) {
  const metrics = [
    {
      title: adminAnalyticsEn.kpis.co2Saved,
      value: (
        <>
          <div>1,234 kg</div>
          <div>Last 30 days</div>
        </>
      ),
      actionLabel: adminAnalyticsEn.actions.viewDetails,
      onAction: () => goTo('/dashboard/analytics/co2-savings'),
    },
    {
      title: adminAnalyticsEn.kpis.totalUserCommutes,
      value: (
        <>
          <div>4,567 trips</div>
          <div>67 this week</div>
        </>
      ),
      actionLabel: adminAnalyticsEn.actions.viewDetails,
      onAction: () => goTo('/dashboard/analytics/commutes'),
    },
    {
      title: adminAnalyticsEn.kpis.tripFrequency,
      value: (
        <>
          <div>2.3 trips / user</div>
          <div>Last 30 days</div>
        </>
      ),
      actionLabel: adminAnalyticsEn.actions.viewDetails,
      onAction: () => goTo('/dashboard/analytics/trip-frequency'),
    },
    {
      title: adminAnalyticsEn.kpis.activeUsers,
      value: (
        <>
          <div>25 users</div>
          <div>18 upcoming routes</div>
        </>
      ),
      actionLabel: adminAnalyticsEn.actions.viewDetails,
      onAction: () => goTo('/dashboard/analytics/activity'),
    },
  ]

  return (
    <>
      <h3>{adminAnalyticsEn.analyticsHub.adminSectionTitle}</h3>
      <MetricsDisplay metrics={metrics} />
    </>
  )
}

AdminAnalytics.propTypes = {
  goTo: PropTypes.func.isRequired,
}

function StudentAnalytics({ goTo }) {
  const metrics = [
    {
      title: adminAnalyticsEn.kpis.myCo2Saved,
      value: '123 kg',
      actionLabel: adminAnalyticsEn.actions.viewDetails,
      onAction: () => goTo('/dashboard/analytics/co2-savings'),
    },
    {
      title: adminAnalyticsEn.kpis.myCommutesDistance,
      value: (
        <>
          <div>12 trips</div>
          <div>32.1 km</div>
          <div>Avg: 2.7 km / trip</div>
        </>
      ),
      actionLabel: adminAnalyticsEn.actions.viewDetails,
      onAction: () => goTo('/dashboard/analytics/commutes'),
    },
    {
      title: adminAnalyticsEn.kpis.myTripFrequency,
      value: '1.8 trips / day',
      actionLabel: adminAnalyticsEn.actions.viewDetails,
      onAction: () => goTo('/dashboard/analytics/trip-frequency'),
    },
  ]

  return (
    <>
      <h3>{adminAnalyticsEn.analyticsHub.studentSectionTitle}</h3>
      <MetricsDisplay metrics={metrics} />
    </>
  )
}

StudentAnalytics.propTypes = {
  goTo: PropTypes.func.isRequired,
}

export default Analytics
