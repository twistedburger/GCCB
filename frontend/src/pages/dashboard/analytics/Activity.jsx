import { useLocation, useNavigate } from 'react-router-dom'
import AnalyticsBlock from '../../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../../components/analytics/KpiGrid'
import ChartCard from '../../../components/analytics/ChartCard'
import ChartPlaceholder from '../../../components/analytics/ChartPlaceholder'

function Activity() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role ?? 'student'
  const isAdmin = role === 'admin'

  // Safeguard: handle via auth or redirect later
  if (!isAdmin) {
    return (
      <>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>

        <h1>Platform Activity</h1>
        <p>This should only be viewable by administrators.</p>
      </>
    )
  }

  const kpis = [
    { label: 'Active route creators (7d)', value: '25' },
    { label: 'Upcoming routes', value: '18' },
    { label: 'Completion rate (30d)', value: '74%' },
    { label: 'Rejected routes (30d)', value: '9' },
  ]

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>Activity (Platform)</h1>
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
            title="Active creators over time"
            subtitle="DAU/WAU-style plot (placeholder)"
          >
            <ChartPlaceholder label="Line chart placeholder" />
          </ChartCard>

          <ChartCard
            title="Upcoming vs completed routes"
            subtitle="(placeholder)"
          >
            <ChartPlaceholder label="Stacked bar placeholder" />
          </ChartCard>

          <ChartCard
            title="Rejection reasons"
            subtitle="Top reasons (placeholder)"
          >
            <ChartPlaceholder label="Bar chart placeholder" />
          </ChartCard>
        </div>
      </AnalyticsBlock>

      <hr />
    </>
  )
}

export default Activity
