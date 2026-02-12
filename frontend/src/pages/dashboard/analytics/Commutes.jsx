import { adminAnalyticsEn } from '../../../locales/adminAnalytics.en'
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

  const S = adminAnalyticsEn.commutes

  // Placeholder values
  const kpis = isAdmin
    ? [
        { label: S.metrics.admin.routesScheduled30d, value: '4,567' },
        { label: S.metrics.admin.totalDistance30d, value: '12,340 km' },
        { label: S.metrics.admin.avgDistancePerRoute, value: '2.7 km' },
        { label: S.metrics.admin.completionRate30d, value: '74%' },
      ]
    : [
        { label: S.metrics.student.myRoutes30d, value: '12' },
        { label: S.metrics.student.myDistance30d, value: '32.1 km' },
        { label: S.metrics.student.avgDistancePerRoute, value: '2.7 km' },
        { label: S.metrics.student.myCompletionRate30d, value: '80%' },
      ]

  const modeBreakdown = [
    { mode: S.modeBreakdown.modes.walk, share: '22%' },
    { mode: S.modeBreakdown.modes.cycle, share: '31%' },
    { mode: S.modeBreakdown.modes.carpool, share: '20%' },
    { mode: S.modeBreakdown.modes.transit, share: '27%' },
  ]

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        {adminAnalyticsEn.common.back}
      </button>

      <h1>{isAdmin ? S.pageTitle.admin : S.pageTitle.student}</h1>
      <p>
        Viewing as: <strong>{role}</strong>
      </p>

      <hr />

      <AnalyticsBlock
        title={S.filters.blockTitle}
        description={S.filters.blockDescription}
      >
        <ul>
          <li>
            <strong>{S.filters.dateRangeLabel}</strong>{' '}
            {S.filters.dateRangeValue}
          </li>
          <li>
            <strong>{S.filters.modeLabel}</strong> {S.filters.modeValue}
          </li>
          <li>
            <strong>{S.filters.statusLabel}</strong> {S.filters.statusValue}
          </li>
        </ul>
      </AnalyticsBlock>

      <AnalyticsBlock
        title={S.metrics.blockTitle}
        description={S.metrics.blockDescription}
      >
        <KpiGrid items={kpis} />
      </AnalyticsBlock>

      <AnalyticsBlock
        title={S.charts.blockTitle}
        description={S.charts.blockDescription}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <ChartCard
            title={S.charts.routesOverTime.title}
            subtitle={S.charts.routesOverTime.subtitle}
          >
            <ChartPlaceholder
              label={S.charts.routesOverTime.placeholderLabel}
            />
          </ChartCard>

          <ChartCard
            title={S.charts.distanceOverTime.title}
            subtitle={S.charts.distanceOverTime.subtitle}
          >
            <ChartPlaceholder
              label={S.charts.distanceOverTime.placeholderLabel}
            />
          </ChartCard>

          <ChartCard
            title={S.charts.modeSplit.title}
            subtitle={S.charts.modeSplit.subtitle}
          >
            <ChartPlaceholder label={S.charts.modeSplit.placeholderLabel} />
          </ChartCard>
        </div>
      </AnalyticsBlock>

      <AnalyticsBlock
        title={S.modeBreakdown.blockTitle}
        description={S.modeBreakdown.blockDescription}
      >
        <ul>
          {modeBreakdown.map(row => (
            <li key={row.mode}>
              <strong>
                {row.mode}
                {S.modeBreakdown.rowLabelSuffix}
              </strong>{' '}
              {row.share}
            </li>
          ))}
        </ul>
      </AnalyticsBlock>

      <hr />
    </>
  )
}

export default Commutes
