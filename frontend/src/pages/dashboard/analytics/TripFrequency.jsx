import { useLocation, useNavigate } from 'react-router-dom'
import AnalyticsBlock from '../../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../../components/analytics/KpiGrid'
import ChartCard from '../../../components/analytics/ChartCard'
import ChartPlaceholder from '../../../components/analytics/ChartPlaceholder'

function TripFrequency() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role ?? 'student'
  const isAdmin = role === 'admin'

  const kpis = isAdmin
    ? [
        { label: 'Avg routes / creator (30d)', value: '2.3' },
        { label: 'Median routes / creator (30d)', value: '1.0' },
        { label: 'Active creators (30d)', value: '41' },
        { label: 'Creators with 2+ routes (30d)', value: '18' },
      ]
    : [
        { label: 'My routes / week', value: '2-3' },
        { label: 'My avg routes / day (7d)', value: '1.8' },
        { label: 'My weekly streak', value: '3 weeks' },
        { label: 'My most active day', value: 'Tuesday' },
      ]

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>{isAdmin ? 'Trip Frequency (All Users)' : 'My Trip Frequency'}</h1>
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
          {isAdmin ? (
            <>
              <ChartCard
                title="Routes per creator distribution"
                subtitle="Histogram buckets (0, 1, 2-3, 4+)"
              >
                <ChartPlaceholder label="Histogram / bar chart placeholder" />
              </ChartCard>

              <ChartCard
                title="Active creators over time"
                subtitle="Trend over time (placeholder)"
              >
                <ChartPlaceholder label="Line chart placeholder" />
              </ChartCard>

              <ChartCard
                title="Routes per day/week"
                subtitle="Platform-level frequency (placeholder)"
              >
                <ChartPlaceholder label="Line / bar chart placeholder" />
              </ChartCard>
            </>
          ) : (
            <>
              <ChartCard
                title="My routes per week"
                subtitle="Weekly volume (placeholder)"
              >
                <ChartPlaceholder label="Bar chart placeholder" />
              </ChartCard>

              <ChartCard
                title="My streak over time"
                subtitle="Consistency trend (placeholder)"
              >
                <ChartPlaceholder label="Line chart placeholder" />
              </ChartCard>

              <ChartCard
                title="My busiest day/time"
                subtitle="Weekday/hour distribution (placeholder)"
              >
                <ChartPlaceholder label="Bar chart placeholder" />
              </ChartCard>
            </>
          )}
        </div>
      </AnalyticsBlock>

      <hr />
    </>
  )
}

export default TripFrequency
