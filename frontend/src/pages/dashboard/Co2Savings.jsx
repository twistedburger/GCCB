import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import PropTypes from 'prop-types'
import AnalyticsBlock from '../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../components/analytics/KpiGrid'
import ChartCard from '../../components/analytics/ChartCard'
import Modal from '../../components/Modal'
import GenericButton from '../../components/GenericButton'
import { formatKg, formatKm } from '../../utils/AnalyticsHelpers'
import { analyticsStrings } from '../../locales/en/AnalyticsStrings'

const co2Strings = analyticsStrings.co2

import {
  MODE_COLORS,
  MODE_LABELS,
  AXIS_TICK_STYLE,
  GRID_STYLE,
} from '../../utils/ChartConfig'

const tooltipPayloadShape = PropTypes.arrayOf(
  PropTypes.shape({
    payload: PropTypes.shape({
      label: PropTypes.string,
      tripCount: PropTypes.number,
      totalCo2SavedKg: PropTypes.number,
      totalDistanceKm: PropTypes.number,
      co2PerKm: PropTypes.number,
    }),
  })
)

/**
 * Displays the CO2 tooltip if payload is active and valid.
 *
 * @param {Object} params Active status and payload
 * @returns {JSX.Element}
 */
function Co2BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-zinc-800">{row.label}</p>
      <p className="text-zinc-600">
        {row.totalCo2SavedKg.toFixed(2)} kg CO₂e saved
      </p>
      <p className="text-zinc-500">
        {row.tripCount} {row.tripCount === 1 ? 'trip' : 'trips'}
      </p>
    </div>
  )
}

Co2BarTooltip.propTypes = {
  active: PropTypes.bool,
  payload: tooltipPayloadShape,
}

/**
 * Displays the CO2 efficiency tooltip if payload is active and valid.
 *
 * @param {Object} params Active status and payload
 * @returns {JSX.Element}
 */
function Co2EfficiencyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-zinc-800">{row.label}</p>
      <p className="text-zinc-600">{row.co2PerKm.toFixed(3)} kg CO₂e / km</p>
      <p className="text-zinc-500">{row.totalDistanceKm.toFixed(2)} km total</p>
    </div>
  )
}

Co2EfficiencyTooltip.propTypes = {
  active: PropTypes.bool,
  payload: tooltipPayloadShape,
}

/**
 * CO2 Savings Page
 *
 * @returns {JSX.Element}
 */
function Co2Savings() {
  const navigate = useNavigate()

  const [summary, setSummary] = useState(null)
  const [byMode, setByMode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showMethodology, setShowMethodology] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError('')

        const [summaryRes, byModeRes] = await Promise.all([
          fetch('http://localhost:3000/api/analytics/summary', {
            credentials: 'include',
          }),
          fetch('http://localhost:3000/api/analytics/by-mode', {
            credentials: 'include',
          }),
        ])

        if (!summaryRes.ok || !byModeRes.ok) {
          throw new Error('Failed to fetch CO₂e analytics')
        }

        const [summaryData, byModeData] = await Promise.all([
          summaryRes.json(),
          byModeRes.json(),
        ])

        setSummary(summaryData)
        setByMode(byModeData)
      } catch (err) {
        console.error('Failed to load CO₂e analytics', err)
        setError('Failed to load CO₂e analytics.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const isAdmin = summary?.scope === 'system'
  const tripCount = summary?.tripCount ?? 0
  const totalDistanceKm = summary?.totalDistanceKm ?? 0
  const totalCo2SavedKg = summary?.totalCo2SavedKg ?? 0
  const avgCo2PerTripKg = tripCount > 0 ? totalCo2SavedKg / tripCount : 0

  const kpis = isAdmin
    ? [
        {
          label: co2Strings.kpis.communitySaved,
          value: loading ? '...' : formatKg(totalCo2SavedKg),
        },
        {
          label: co2Strings.kpis.avgPerTrip,
          value: loading ? '...' : formatKg(avgCo2PerTripKg),
        },
        {
          label: co2Strings.kpis.tripsIncluded,
          value: loading ? '...' : `${tripCount}`,
        },
        {
          label: co2Strings.kpis.distanceIncluded,
          value: loading ? '...' : formatKm(totalDistanceKm),
        },
      ]
    : [
        {
          label: co2Strings.kpis.personalSaved,
          value: loading ? '...' : formatKg(totalCo2SavedKg),
        },
        {
          label: co2Strings.kpis.avgPerTrip,
          value: loading ? '...' : formatKg(avgCo2PerTripKg),
        },
        {
          label: co2Strings.kpis.tripsIncluded,
          value: loading ? '...' : `${tripCount}`,
        },
        {
          label: co2Strings.kpis.distanceIncluded,
          value: loading ? '...' : formatKm(totalDistanceKm),
        },
      ]

  const chartData = useMemo(() => {
    return (byMode?.data ?? [])
      .filter(row => row.totalCo2SavedKg > 0)
      .map(row => ({
        ...row,
        label: MODE_LABELS[row.mode] ?? row.mode,
        fill: MODE_COLORS[row.mode] ?? '#b3b3b3',
      }))
  }, [byMode?.data])

  // Efficiency chart: kg CO₂e saved per km; show only modes with distance data
  const efficiencyChartData = useMemo(() => {
    return (byMode?.data ?? [])
      .filter(row => row.totalDistanceKm > 0 && row.totalCo2SavedKg > 0)
      .map(row => ({
        ...row,
        label: MODE_LABELS[row.mode] ?? row.mode,
        fill: MODE_COLORS[row.mode] ?? 'var(--color-medium-grey)',
        co2PerKm: row.totalCo2SavedKg / row.totalDistanceKm,
      }))
      .sort(
        (firstEntry, secondEntry) => secondEntry.co2PerKm - firstEntry.co2PerKm
      )
  }, [byMode?.data])

  return (
    <div className="relative mx-auto w-full max-w-5xl p-4">
      <GenericButton
        type="button"
        onClick={() => navigate(-1)}
        unstyled
        customStyling="mb-4 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
      >
        {analyticsStrings.common.back}
      </GenericButton>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {isAdmin ? co2Strings.pageTitle.admin : co2Strings.pageTitle.user}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          {isAdmin
            ? co2Strings.pageDescription.admin
            : co2Strings.pageDescription.user}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <p className="text-xs text-zinc-400">{co2Strings.disclaimer}</p>
          <GenericButton
            onClick={() => setShowMethodology(true)}
            unstyled
            customStyling="shrink-0 text-xs font-medium text-blue-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            {co2Strings.howCalculated}
          </GenericButton>
        </div>
      </div>
      {showMethodology && (
        <div className="fixed inset-y-0 right-0 left-13.75 overflow-hidden z-50">
          <Modal
            isOpen={showMethodology}
            onClose={() => setShowMethodology(false)}
            title={co2Strings.modal.title}
          >
            <div className="text-sm text-zinc-700 space-y-5">
              <div>
                <h4 className="font-semibold text-zinc-900 mb-2">
                  {co2Strings.modal.baseline.heading}
                </h4>
                <p className="text-zinc-600">
                  {co2Strings.modal.baseline.body}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-900 mb-3">
                  {co2Strings.modal.emissionFactors.heading}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200">
                        <th className="text-left py-2 pr-4 font-semibold text-zinc-700">
                          {co2Strings.modal.emissionFactors.columns.mode}
                        </th>
                        <th className="text-left py-2 pr-4 font-semibold text-zinc-700">
                          {co2Strings.modal.emissionFactors.columns.factor}
                        </th>
                        <th className="text-left py-2 font-semibold text-zinc-700">
                          {co2Strings.modal.emissionFactors.columns.basis}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {co2Strings.modal.emissionFactors.rows.map(row => (
                        <tr key={row.mode}>
                          <td className="py-2 pr-4 text-zinc-800">
                            {row.mode}
                          </td>
                          <td className="py-2 pr-4 font-mono text-zinc-600">
                            {row.factor}
                          </td>
                          <td className="py-2 text-zinc-500">{row.basis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-900 mb-3">
                  {co2Strings.modal.formulas.heading}
                </h4>
                <div className="space-y-3">
                  <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                    <p className="font-medium text-zinc-800 mb-1">
                      {co2Strings.modal.formulas.walk.label}
                    </p>
                    <p className="font-mono text-xs text-zinc-500 mb-1">
                      {co2Strings.modal.formulas.walk.formula}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {co2Strings.modal.formulas.walk.note}
                    </p>
                  </div>
                  <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                    <p className="font-medium text-zinc-800 mb-1">
                      {co2Strings.modal.formulas.transit.label}
                    </p>
                    <p className="font-mono text-xs text-zinc-500 mb-1">
                      {co2Strings.modal.formulas.transit.formula}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {co2Strings.modal.formulas.transit.note}
                    </p>
                  </div>
                  <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                    <p className="font-medium text-zinc-800 mb-1">
                      {co2Strings.modal.formulas.carpool.label}
                    </p>
                    <p className="font-mono text-xs text-zinc-500 mb-1">
                      {co2Strings.modal.formulas.carpool.formulaSystem}
                    </p>
                    <p className="font-mono text-xs text-zinc-500 mb-1">
                      {co2Strings.modal.formulas.carpool.formulaUser}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {co2Strings.modal.formulas.carpool.note}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 pt-1 border-t border-zinc-100">
                {co2Strings.modal.footnote}
              </p>
            </div>
          </Modal>
        </div>
      )}
      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col">
        <AnalyticsBlock
          title={co2Strings.blocks.keyMetrics.title}
          description={
            isAdmin
              ? co2Strings.blocks.keyMetrics.descriptionAdmin
              : co2Strings.blocks.keyMetrics.descriptionUser
          }
        >
          <KpiGrid items={kpis} />
        </AnalyticsBlock>

        <AnalyticsBlock
          title={co2Strings.blocks.overview.title}
          description={co2Strings.blocks.overview.description}
        >
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              {analyticsStrings.common.loadingCharts}
            </div>
          ) : chartData.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              {analyticsStrings.common.noData}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <ChartCard
                title={co2Strings.charts.byMode.title}
                subtitle={co2Strings.charts.byMode.subtitle}
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid {...GRID_STYLE} vertical={false} />
                    <XAxis dataKey="label" tick={AXIS_TICK_STYLE} />
                    <YAxis
                      tick={AXIS_TICK_STYLE}
                      width={56}
                      tickFormatter={value => `${value} kg`}
                    />
                    <Tooltip content={<Co2BarTooltip />} />
                    <Bar
                      dataKey="totalCo2SavedKg"
                      radius={[6, 6, 0, 0]}
                      fill="fill"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title={co2Strings.charts.efficiency.title}
                subtitle={co2Strings.charts.efficiency.subtitle}
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={efficiencyChartData}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid {...GRID_STYLE} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={AXIS_TICK_STYLE}
                      tickFormatter={value => `${value.toFixed(2)}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={AXIS_TICK_STYLE}
                      width={72}
                    />
                    <Tooltip content={<Co2EfficiencyTooltip />} />
                    <Bar dataKey="co2PerKm" radius={[0, 6, 6, 0]} fill="fill" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}
        </AnalyticsBlock>
      </div>
    </div>
  )
}

export default Co2Savings
