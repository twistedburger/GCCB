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

        <p>Methodology goes here!</p>

        <h3>
          <strong>Baseline</strong>
        </h3>
        <p>
          We estimate &quot;savings&quot; by comparing a trip against a standard
          solo-passenger vehicle baseline (~250g CO₂ per km). The difference is
          treated as CO₂ saved.
        </p>

        <h3>
          <strong>Carpooling</strong>
        </h3>
        <p>
          A possible calculation is to scale savings by (passengers - 1), since
          one carpool trip may replace multiple solo trips depending on number
          of passengers.
        </p>

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

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>CO₂ Savings</h1>

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

      {isAdmin ? (
        <>
          <h3>Admin breakdown</h3>
          <p>
            Placeholder: totals by commute mode, date filters, active users
            impact.
          </p>
        </>
      ) : (
        <>
          <h3>My breakdown</h3>
          <p>Placeholder: my trips by mode, my weekly/monthly trend.</p>
        </>
      )}

      <Co2InfoModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
