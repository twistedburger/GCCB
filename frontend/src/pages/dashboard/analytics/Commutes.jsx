import { useLocation, useNavigate } from 'react-router-dom'
import AnalyticsBlock from '../../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../../components/analytics/KpiGrid'
import ChartCard from '../../../components/analytics/ChartCard'
import ChartPlaceholder from '../../../components/analytics/ChartPlaceholder'

function Commutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role ?? 'student'
  const isAdmin = role === 'admin'

  // Placeholder values
  const kpis = isAdmin
    ? [
        { label: 'Routes scheduled (30d)', value: '4,567' },
        { label: 'Total distance (30d)', value: '12,340 km' },
        { label: 'Avg distance / route', value: '2.7 km' },
        { label: 'Completion rate (30d)', value: '74%' },
      ]
    : [
        { label: 'My routes (30d)', value: '12' },
        { label: 'My distance (30d)', value: '32.1 km' },
        { label: 'Avg distance / route', value: '2.7 km' },
        { label: 'My completion rate (30d)', value: '80%' },
      ]

  const modeBreakdown = [
    { mode: 'Walk', share: '22%' },
    { mode: 'Cycle', share: '31%' },
    { mode: 'Carpool', share: '20%' },
    { mode: 'Transit', share: '27%' },
  ]

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>{isAdmin ? 'Commutes (All Users)' : 'My Commutes'}</h1>
      <p>
        Viewing as: <strong>{role}</strong>
      </p>

      <hr />

      <AnalyticsBlock title="Filters" description="Placeholder controls">
        <ul>
          <li>
            <strong>Date range:</strong> Last 7 days / Last 30 days / All Time
          </li>
          <li>
            <strong>Mode:</strong> Walk / Cycle / Carpool / Transit
          </li>
          <li>
            <strong>Status:</strong> Upcoming / Completed / Rejected
          </li>
        </ul>
      </AnalyticsBlock>

      <AnalyticsBlock
        title="Key metrics"
        description="Summary values (placeholder)"
      >
        <KpiGrid items={kpis} />
      </AnalyticsBlock>

      <AnalyticsBlock title="Charts" description="Chart placeholders">
        <div style={{ display: 'grid', gap: 12 }}>
          <ChartCard
            title="Routes over time"
            subtitle="Daily/weekly volume (placeholder)"
          >
            <ChartPlaceholder label="Bar/Line chart placeholder" />
          </ChartCard>

          <ChartCard
            title="Distance over time"
            subtitle="Total km per day/week (placeholder)"
          >
            <ChartPlaceholder label="Line chart placeholder" />
          </ChartCard>

          <ChartCard
            title="Mode split"
            subtitle="Share of routes by transportation mode (placeholder)"
          >
            <ChartPlaceholder label="Pie/Stacked bar placeholder" />
          </ChartCard>
        </div>
      </AnalyticsBlock>

      <AnalyticsBlock
        title="Mode Breakdown by Type"
        description="Placeholder breakdown"
      >
        <ul>
          {modeBreakdown.map(row => (
            <li key={row.mode}>
              <strong>{row.mode}:</strong> {row.share}
            </li>
          ))}
        </ul>
      </AnalyticsBlock>

      <hr />
    </>
  )
}

export default Commutes
