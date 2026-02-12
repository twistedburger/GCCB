import { adminAnalyticsEn } from '../../../locales/adminAnalytics.en'
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

  const S = adminAnalyticsEn.tripFrequency

  const kpis = isAdmin
    ? [
        { label: S.metrics.admin.avgRoutesPerCreator30d, value: '2.3' },
        { label: S.metrics.admin.medianRoutesPerCreator30d, value: '1.0' },
        { label: S.metrics.admin.activeCreators30d, value: '41' },
        { label: S.metrics.admin.creatorsWith2PlusRoutes30d, value: '18' },
      ]
    : [
        { label: S.metrics.student.myRoutesPerWeek, value: '2-3' },
        { label: S.metrics.student.myAvgRoutesPerDay7d, value: '1.8' },
        { label: S.metrics.student.myWeeklyStreak, value: '3 weeks' },
        {
          label: S.metrics.student.myMostActiveDay,
          value: S.metrics.values.tuesday,
        },
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
          {isAdmin ? (
            <>
              <ChartCard
                title={S.charts.admin.distribution.title}
                subtitle={S.charts.admin.distribution.subtitle}
              >
                <ChartPlaceholder
                  label={S.charts.admin.distribution.placeholderLabel}
                />
              </ChartCard>

              <ChartCard
                title={S.charts.admin.activeCreatorsOverTime.title}
                subtitle={S.charts.admin.activeCreatorsOverTime.subtitle}
              >
                <ChartPlaceholder
                  label={S.charts.admin.activeCreatorsOverTime.placeholderLabel}
                />
              </ChartCard>

              <ChartCard
                title={S.charts.admin.routesPerDayWeek.title}
                subtitle={S.charts.admin.routesPerDayWeek.subtitle}
              >
                <ChartPlaceholder
                  label={S.charts.admin.routesPerDayWeek.placeholderLabel}
                />
              </ChartCard>
            </>
          ) : (
            <>
              <ChartCard
                title={S.charts.student.routesPerWeek.title}
                subtitle={S.charts.student.routesPerWeek.subtitle}
              >
                <ChartPlaceholder
                  label={S.charts.student.routesPerWeek.placeholderLabel}
                />
              </ChartCard>

              <ChartCard
                title={S.charts.student.streakOverTime.title}
                subtitle={S.charts.student.streakOverTime.subtitle}
              >
                <ChartPlaceholder
                  label={S.charts.student.streakOverTime.placeholderLabel}
                />
              </ChartCard>

              <ChartCard
                title={S.charts.student.busiestDayTime.title}
                subtitle={S.charts.student.busiestDayTime.subtitle}
              >
                <ChartPlaceholder
                  label={S.charts.student.busiestDayTime.placeholderLabel}
                />
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
