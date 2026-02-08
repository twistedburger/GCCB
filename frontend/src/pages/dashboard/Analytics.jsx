import { useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

function MetricCard({ title, value, actionLabel, onAction }) {
  return (
    <>
      <p>
        <strong>{title}</strong>
      </p>
      <p>{value}</p>
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
  value: PropTypes.string.isRequired,
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
      value: PropTypes.string.isRequired,
      actionLabel: PropTypes.string,
      onAction: PropTypes.func,
    })
  ).isRequired,
}

function Analytics() {
  const [role, setRole] = useState('student') // "student" || "admin"
  const navigate = useNavigate()

  const goToCo2Savings = () => {
    navigate('/dashboard/analytics/co2-savings', { state: { role } })
  }

  return (
    <>
      <h1>This is the Analytics Page</h1>
      <p>
        Current Role: <strong>{role}</strong>
      </p>
      {/* Temporary: role toggle for UI testing; route via Auth/Permissions */}
      <button type="button" onClick={() => setRole('student')}>
        View as Student
      </button>{' '}
      <br />
      <button type="button" onClick={() => setRole('admin')}>
        View as Admin
      </button>
      <hr />
      {role === 'admin' ? (
        <AdminAnalytics onGoToCo2Savings={goToCo2Savings} />
      ) : (
        <StudentAnalytics onGoToCo2Savings={goToCo2Savings} />
      )}
    </>
  )
}

function AdminAnalytics({ onGoToCo2Savings }) {
  const metrics = [
    {
      title: 'Total CO₂ Saved (est.)',
      value: '1,234 kg',
      actionLabel: 'View details',
      onAction: onGoToCo2Savings,
    },
    {
      title: 'Total User Commutes',
      value: '4,567 trips',
      actionLabel: 'View details',
      onAction: () => console.log('TODO: commute details'),
    },
    {
      title: 'Trip Frequency',
      value: '2.3 trips / user',
      actionLabel: 'View details',
      onAction: () => console.log('TODO: trip frequency'),
    },
    {
      title: 'Active Users',
      value: '25 commuters',
      actionLabel: 'View details',
      onAction: () => console.log('TODO: active users'),
    },
  ]

  return (
    <>
      <h3>Admin Overview (All Users)</h3>
      <MetricsDisplay metrics={metrics} />
    </>
  )
}

AdminAnalytics.propTypes = {
  onGoToCo2Savings: PropTypes.func.isRequired,
}

function StudentAnalytics({ onGoToCo2Savings }) {
  const metrics = [
    {
      title: 'My CO₂ Saved (est.)',
      value: '123 kg',
      actionLabel: 'View details',
      onAction: onGoToCo2Savings,
    },
    {
      title: 'My Total Commutes',
      value: '12 trips',
      actionLabel: 'View details',
      onAction: () => console.log('TODO: my commute history'),
    },
    {
      title: 'My Total Distance',
      value: '32.1 km',
      actionLabel: 'View details',
      onAction: () => console.log('TODO: my distance'),
    },
    {
      title: 'My Trip Frequency',
      value: '1.8 trips / day',
      actionLabel: 'View details',
      onAction: () => console.log('TODO: my trip frequency'),
    },
  ]

  return (
    <>
      <h3>My Impact (Personal)</h3>
      <MetricsDisplay metrics={metrics} />
    </>
  )
}

StudentAnalytics.propTypes = {
  onGoToCo2Savings: PropTypes.func.isRequired,
}

export default Analytics
