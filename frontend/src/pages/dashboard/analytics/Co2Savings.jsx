import { adminAnalyticsEn } from '../../../locales/adminAnalytics.en'

import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import PropTypes from 'prop-types'
import AnalyticsBlock from '../../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../../components/analytics/KpiGrid'
import ChartCard from '../../../components/analytics/ChartCard'
import ChartPlaceholder from '../../../components/analytics/ChartPlaceholder'

function Co2InfoModal({ open, onClose }) {
  if (!open) return null

  const S = adminAnalyticsEn.co2

  return (
    <div
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={S.modal.title}
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-extrabold text-text-primary">
          {S.modal.title}
        </h2>

        <p className="mt-3 text-sm font-medium text-text-secondary">
          {S.modal.intro}
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-text-primary">
              {S.modal.baselineTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {S.modal.baselineBody}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-text-primary">
              {S.modal.carpoolTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {S.modal.carpoolBody}
            </p>
          </div>
        </div>
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

  const S = adminAnalyticsEn.co2

  const headline = isAdmin ? '1,234 kg' : '123 kg'

  const kpis = isAdmin
    ? [
        { label: S.metrics.admin.totalSaved30d, value: '1,234 kg' },
        { label: S.metrics.admin.avgSavedPerRoute, value: '0.27 kg' },
        { label: S.metrics.admin.routesContributing30d, value: '4,567' },
        {
          label: S.metrics.admin.topSavingMode,
          value: S.metrics.values.cycling,
        },
      ]
    : [
        { label: S.metrics.student.mySaved30d, value: '123 kg' },
        { label: S.metrics.student.avgSavedPerTrip, value: '0.30 kg' },
        { label: S.metrics.student.tripsContributing30d, value: '12' },
        {
          label: S.metrics.student.myTopSavingMode,
          value: S.metrics.values.cycling,
        },
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

      <p>
        <strong>
          {isAdmin ? S.headline.adminLabel : S.headline.studentLabel}:
        </strong>{' '}
        {headline}
      </p>

      <button type="button" onClick={() => setIsModalOpen(true)}>
        {S.actions.howCalculated}
      </button>

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
          <ChartCard
            title={S.charts.overTime.title}
            subtitle={S.charts.overTime.subtitle}
          >
            <ChartPlaceholder label={S.charts.overTime.placeholderLabel} />
          </ChartCard>

          <ChartCard
            title={S.charts.byMode.title}
            subtitle={S.charts.byMode.subtitle}
          >
            <ChartPlaceholder label={S.charts.byMode.placeholderLabel} />
          </ChartCard>

          <ChartCard
            title={
              isAdmin
                ? S.charts.contributors.adminTitle
                : S.charts.contributors.studentTitle
            }
            subtitle={S.charts.contributors.subtitle}
          >
            <ChartPlaceholder label={S.charts.contributors.placeholderLabel} />
          </ChartCard>
        </div>
      </AnalyticsBlock>

      <hr />

      <Co2InfoModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default Co2Savings
