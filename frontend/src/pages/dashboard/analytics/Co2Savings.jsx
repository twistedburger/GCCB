import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import PropTypes from 'prop-types'
import AnalyticsBlock from '../../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../../components/analytics/KpiGrid'
import ChartCard from '../../../components/analytics/ChartCard'
import ChartPlaceholder from '../../../components/analytics/ChartPlaceholder'

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

function Co2Savings() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const role = location.state?.role ?? 'student'
  const isAdmin = role === 'admin'

  const headline = isAdmin ? '1,234 kg' : '123 kg'

  const kpis = isAdmin
    ? [
        { label: 'Total CO₂ saved (30d)', value: '1,234 kg' },
        { label: 'Avg CO₂ saved / route', value: '0.27 kg' },
        { label: 'Routes contributing (30d)', value: '4,567' },
        { label: 'Top saving mode', value: 'Cycling' },
      ]
    : [
        { label: 'My CO₂ saved (30d)', value: '123 kg' },
        { label: 'Avg CO₂ saved / trip', value: '0.30 kg' },
        { label: 'Trips contributing (30d)', value: '12' },
        { label: 'My top saving mode', value: 'Cycling' },
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
        {headline}
      </p>

      <button type="button" onClick={() => setIsModalOpen(true)}>
        How it&apos;s calculated
      </button>

      <hr />

      <AnalyticsBlock title="Filters" description="Placeholder controls">
        <ul>
          <li>
            <strong>Date range:</strong> Last 7 days / Last 30 days / All Time
          </li>
          <li>
            <strong>Mode:</strong> Walk / Cycle / Carpool / Transit
          </li>
        </ul>
      </AnalyticsBlock>

      <AnalyticsBlock
        title="Key impact metrics"
        description="Summary values (placeholder)"
      >
        <KpiGrid items={kpis} />
      </AnalyticsBlock>

      <AnalyticsBlock title="Charts" description="Chart placeholders">
        <div style={{ display: 'grid', gap: 12 }}>
          <ChartCard
            title="CO₂ saved over time"
            subtitle="Weekly/monthly trend (placeholder)"
          >
            <ChartPlaceholder label="Line chart placeholder" />
          </ChartCard>

          <ChartCard
            title="CO₂ saved by mode"
            subtitle="Share by transportation mode (placeholder)"
          >
            <ChartPlaceholder label="Pie/Stacked bar placeholder" />
          </ChartCard>

          <ChartCard
            title={isAdmin ? 'Top contributors (admin)' : 'My progress'}
            subtitle="Optional breakdown (placeholder)"
          >
            <ChartPlaceholder label="Table/Bar chart placeholder" />
          </ChartCard>
        </div>
      </AnalyticsBlock>

      <hr />

      <Co2InfoModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default Co2Savings
