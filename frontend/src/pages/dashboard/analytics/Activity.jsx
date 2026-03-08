import { adminAnalyticsEn } from '../../../locales/adminAnalytics.en'
import { useLocation, useNavigate } from 'react-router-dom'
import AnalyticsBlock from '../../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../../components/analytics/KpiGrid'
import ChartCard from '../../../components/analytics/ChartCard'
import ChartPlaceholder from '../../../components/analytics/ChartPlaceholder'
import GenericButton from '../../../components/GenericButton'

function Activity() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role ?? 'student'
  const isAdmin = role === 'admin'

  const S = adminAnalyticsEn.activity

  // Safeguard: handle via auth or redirect later
  if (!isAdmin) {
    return (
      <>
        <GenericButton
          type="button"
          onClick={() => navigate(-1)}
          unstyled
          customStyling="mb-4 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          {adminAnalyticsEn.common.back}
        </GenericButton>

        <h1>{S.guard.pageTitle}</h1>
        <p>{S.guard.message}</p>
      </>
    )
  }

  const kpis = [
    { label: S.metrics.activeRouteCreators7d, value: '25' },
    { label: S.metrics.upcomingRoutes, value: '18' },
    { label: S.metrics.completionRate30d, value: '74%' },
    { label: S.metrics.rejectedRoutes30d, value: '9' },
  ]

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        {adminAnalyticsEn.common.back}
      </button>

      <h1>{S.pageTitle}</h1>
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
            title={S.charts.activeCreatorsOverTime.title}
            subtitle={S.charts.activeCreatorsOverTime.subtitle}
          >
            <ChartPlaceholder
              label={S.charts.activeCreatorsOverTime.placeholderLabel}
            />
          </ChartCard>

          <ChartCard
            title={S.charts.upcomingVsCompleted.title}
            subtitle={S.charts.upcomingVsCompleted.subtitle}
          >
            <ChartPlaceholder
              label={S.charts.upcomingVsCompleted.placeholderLabel}
            />
          </ChartCard>

          <ChartCard
            title={S.charts.rejectionReasons.title}
            subtitle={S.charts.rejectionReasons.subtitle}
          >
            <ChartPlaceholder
              label={S.charts.rejectionReasons.placeholderLabel}
            />
          </ChartCard>
        </div>
      </AnalyticsBlock>

      <hr />
    </>
  )
}

export default Activity
