import { useState } from 'react'
import PropTypes from 'prop-types'

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

MetricCard.defaultProps = {
  actionLabel: undefined,
  onAction: undefined,
}
function Co2InfoModal({ open, onClose }) {
  if (!open) return null

  return (
    <div
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        // Temporary: style to be changed/updated via Tailwind
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          color: 'black',
          width: '100%',
          maxWidth: 600,
          padding: 16,
          borderRadius: 8,
        }}
      >
        <h2>How CO₂ is calculated</h2>

        <p>Methodology goes here!</p>

        <h3>Baseline idea</h3>
        <p>
          We estimate &quot;savings&quot; by comparing a trip against a standard
          solo-passenger vehicle baseline (~250g CO₂ per km). The difference is
          treated as CO₂ saved.
        </p>

        <h3>Carpool (draft rule)</h3>
        <p>
          A possible calculation is to scale savings by
          <strong>(passengers - 1)</strong>, since one carpool trip may replace
          multiple solo trips depending on number of passengers.
        </p>

        <h3>Notes</h3>
        <ul>
          <li>Walking/cycling assumed near-zero operational emissions.</li>
          <li>
            Transit is treated as lower than solo-car (placeholder; will
            deliberate).
          </li>
          <li>Current baseline is directly from EPA.gov.</li>
        </ul>

        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

Co2InfoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

function Analytics() {
  const [role, setRole] = useState('student') // "student" || "admin" || possibly "moderator"

  return (
    <>
      <h1>This is the Analytics Page</h1>
      <p>
        Current Role: <strong>{role}</strong>
      </p>
      {/* Temporary: role toggle for UI testing */}
      <button type="button" onClick={() => setRole('student')}>
        View as Student
      </button>{' '}
      <br></br>
      <button type="button" onClick={() => setRole('admin')}>
        View as Admin
      </button>
      <hr />
      {role === 'admin' ? <AdminAnalytics /> : <StudentAnalytics />}
    </>
  )
}

function AdminAnalytics() {
  const metrics = [
    {
      title: 'Total CO₂ Saved (est.)',
      value: '1,234 kg',
      actionLabel: "How it's calculated",
      onAction: () => console.log('TODO: CO2 calculation info'),
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

function StudentAnalytics() {
  const metrics = [
    {
      title: 'My CO₂ Saved (est.)',
      value: '123 kg',
      actionLabel: "How it's calculated",
      onAction: () => console.log('TODO: CO2 calculation info'),
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

export default Analytics
