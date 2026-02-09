import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import PropTypes from 'prop-types'

function Co2InfoModal({ open, onClose }) {
  if (!open) return null

  return (
    <div
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
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
          maxWidth: 700,
          padding: 16,
          borderRadius: 8,
        }}
      >
        <h2>
          <strong>How CO₂ is calculated</strong>
        </h2>

        <p>
          CO₂ savings are estimated by comparing each route against a
          solo-passenger vehicle baseline.
        </p>

        <h3>
          <strong>Baseline</strong>
        </h3>
        <p>
          We estimate savings using a standard solo vehicle baseline of ~250g
          CO₂ per km. The difference between this baseline and the selected
          transportation mode is treated as CO₂ saved.
        </p>

        <h3>
          <strong>Carpooling</strong>
        </h3>
        <p>
          Savings may be scaled by (passengers − 1), since a single carpool trip
          can replace multiple solo trips depending on participation.
        </p>

        <h3>
          <strong>Notes</strong>
        </h3>
        <ul>
          <li>
            Walking and cycling are treated as zero operational emissions.
          </li>
          <li>Transit uses a reduced per-passenger estimate (placeholder).</li>
          <li>Baseline values are provisional and subject to refinement.</li>
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

export default function Co2Savings() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const role = location.state?.role ?? 'student'
  const isAdmin = role === 'admin'

  // Placeholder KPIs
  const kpis = isAdmin
    ? [
        { label: 'Total CO₂ saved (30d)', value: '1,234 kg' },
        { label: 'Avg CO₂ saved / route', value: '0.27 kg' },
        { label: 'Routes contributing to savings', value: '4,567' },
        { label: 'Top saving mode', value: 'Cycling' },
      ]
    : [
        { label: 'My CO₂ saved (30d)', value: '123 kg' },
        { label: 'Avg CO₂ saved / trip', value: '0.30 kg' },
        { label: 'Trips contributing to savings', value: '12' },
        { label: 'My top saving mode', value: 'Cycling' },
      ]

  const modeSplit = [
    { mode: 'Walk', share: '22%' },
    { mode: 'Cycle', share: '31%' },
    { mode: 'Transit', share: '27%' },
    { mode: 'Carpool', share: '20%' },
  ]

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>CO₂ Savings</h1>
      <p>
        Viewing as: <strong>{role}</strong>
      </p>

      <p>
        <strong>
          {isAdmin ? 'Total CO₂ Saved (All Users)' : 'My CO₂ Saved'}:
        </strong>{' '}
        {isAdmin ? '1,234 kg' : '123 kg'}
      </p>

      <button type="button" onClick={() => setIsModalOpen(true)}>
        How it&apos;s calculated
      </button>

      <hr />

      <h3>Key impact metrics</h3>
      <ul>
        {kpis.map(k => (
          <li key={k.label}>
            <strong>{k.label}:</strong> {k.value}
          </li>
        ))}
      </ul>

      <hr />

      <h3>CO₂ savings by transportation mode (placeholder)</h3>
      <ul>
        {modeSplit.map(row => (
          <li key={row.mode}>
            <strong>{row.mode}:</strong> {row.share}
          </li>
        ))}
      </ul>

      <hr />

      <h3>Trends (placeholders)</h3>
      <ul>
        <li>
          <strong>CO₂ saved over time:</strong> line chart (weekly/monthly)
        </li>
        <li>
          <strong>Cumulative CO₂ saved:</strong> cumulative line chart
        </li>
      </ul>

      <hr />

      <Co2InfoModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
