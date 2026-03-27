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
import { formatKg, formatKm } from '../../utils/analyticsHelpers'
import { adminAnalyticsEn } from '../../locales/adminAnalytics.en'
import {
  MODE_COLORS,
  MODE_LABELS,
  AXIS_TICK_STYLE,
  GRID_STYLE,
} from '../../utils/chartConfig'

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
          label: 'Community CO₂e Saved',
          value: loading ? '...' : formatKg(totalCo2SavedKg),
        },
        {
          label: 'Avg CO₂e Saved / Trip',
          value: loading ? '...' : formatKg(avgCo2PerTripKg),
        },
        {
          label: 'Trips Included',
          value: loading ? '...' : `${tripCount}`,
        },
        {
          label: 'Distance Included',
          value: loading ? '...' : formatKm(totalDistanceKm),
        },
      ]
    : [
        {
          label: 'Personal CO₂e Saved',
          value: loading ? '...' : formatKg(totalCo2SavedKg),
        },
        {
          label: 'Avg CO₂e Saved / Trip',
          value: loading ? '...' : formatKg(avgCo2PerTripKg),
        },
        {
          label: 'Trips Included',
          value: loading ? '...' : `${tripCount}`,
        },
        {
          label: 'Distance Included',
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
        fill: MODE_COLORS[row.mode] ?? '#b3b3b3',
        co2PerKm: row.totalCo2SavedKg / row.totalDistanceKm,
      }))
      .sort((a, b) => b.co2PerKm - a.co2PerKm)
  }, [byMode?.data])

  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <GenericButton
        type="button"
        onClick={() => navigate(-1)}
        unstyled
        customStyling="mb-4 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
      >
        {adminAnalyticsEn.common.back}
      </GenericButton>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {isAdmin ? 'Community CO₂e Savings' : 'My CO₂e Savings'}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          {isAdmin
            ? 'Track estimated emissions avoided across all completed community trips. Use this to see which modes are contributing the most impact and where the community is making the biggest difference.'
            : "Track the estimated emissions you've avoided across your completed trips. Every route you take by foot, bike, or transit instead of driving alone contributes to this total."}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <p className="text-xs text-zinc-400">
            All values are estimates for awareness and analytics purposes, not
            exact real-world measurements.
          </p>
          <GenericButton
            onClick={() => setShowMethodology(true)}
            unstyled
            customStyling="shrink-0 text-xs font-medium text-blue-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            How is this calculated?
          </GenericButton>
        </div>
      </div>

      <Modal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
        title="How CO₂e savings are calculated"
        className="max-w-2xl"
      >
        <div className="text-sm text-zinc-700 space-y-5">
          <div>
            <h4 className="font-semibold text-zinc-900 mb-2">Baseline</h4>
            <p className="text-zinc-600">
              The baseline is a solo petrol car emitting{' '}
              <span className="font-medium text-zinc-800">
                170 g CO₂e per vehicle-km
              </span>
              . Every saving is calculated as the difference between what a trip
              would have emitted under this baseline and what it actually
              emitted.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 mb-3">
              Emission factors
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-2 pr-4 font-semibold text-zinc-700">
                      Mode
                    </th>
                    <th className="text-left py-2 pr-4 font-semibold text-zinc-700">
                      Factor
                    </th>
                    <th className="text-left py-2 font-semibold text-zinc-700">
                      Basis
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="py-2 pr-4 text-zinc-800">
                      Petrol car (baseline)
                    </td>
                    <td className="py-2 pr-4 font-mono text-zinc-600">
                      170 g / vehicle-km
                    </td>
                    <td className="py-2 text-zinc-500">Solo occupant</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-zinc-800">Electric car</td>
                    <td className="py-2 pr-4 font-mono text-zinc-600">
                      47 g / vehicle-km
                    </td>
                    <td className="py-2 text-zinc-500">Solo occupant</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-zinc-800">Bus / Transit</td>
                    <td className="py-2 pr-4 font-mono text-zinc-600">
                      97 g / passenger-km
                    </td>
                    <td className="py-2 text-zinc-500">Per passenger</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-zinc-800">Rail</td>
                    <td className="py-2 pr-4 font-mono text-zinc-600">
                      35 g / passenger-km
                    </td>
                    <td className="py-2 text-zinc-500">Per passenger</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-zinc-800">Walk / Bicycle</td>
                    <td className="py-2 pr-4 font-mono text-zinc-600">
                      0 g / km
                    </td>
                    <td className="py-2 text-zinc-500">
                      Zero direct emissions
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 mb-3">
              Savings formula by mode
            </h4>
            <div className="space-y-3">
              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                <p className="font-medium text-zinc-800 mb-1">Walk / Bicycle</p>
                <p className="font-mono text-xs text-zinc-500 mb-1">
                  Savings = distance * 170 ÷ 1000
                </p>
                <p className="text-xs text-zinc-500">
                  Full baseline avoided; zero emissions produced.
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                <p className="font-medium text-zinc-800 mb-1">Bus / Rail</p>
                <p className="font-mono text-xs text-zinc-500 mb-1">
                  Savings = distance * (170 - transit_factor) ÷ 1000
                </p>
                <p className="text-xs text-zinc-500">
                  Partial Saving; transit still emits, but far less than the
                  solo-car baseline per passenger.
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                <p className="font-medium text-zinc-800 mb-1">Carpool</p>
                <p className="font-mono text-xs text-zinc-500 mb-1">
                  System Savings = distance * (passengers * 170 -
                  vehicle_factor) ÷ 1000
                </p>
                <p className="font-mono text-xs text-zinc-500 mb-1">
                  Your Individual Share = system savings ÷ passengers
                </p>
                <p className="text-xs text-zinc-500">
                  Savings scale with group size. An electric carpool saves
                  significantly more than a petrol one.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-400 pt-1 border-t border-zinc-100">
            Emission factors sourced from Our World in Data / International
            Council on Clean Transportation. Routes are calculated
            segment-by-segment.
          </p>
        </div>
      </Modal>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col">
        <AnalyticsBlock
          title="Key metrics"
          description={
            isAdmin
              ? 'Aggregate CO₂e totals across all completed community routes.'
              : 'Your CO₂e totals based on routes you participated in.'
          }
        >
          <KpiGrid items={kpis} />
        </AnalyticsBlock>

        <AnalyticsBlock
          title="CO₂e savings overview"
          description="Estimated savings across all completed trips, broken down by mode."
        >
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              Loading charts...
            </div>
          ) : chartData.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              No chart data available yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <ChartCard
                title="CO₂e saved by mode"
                subtitle="Total kg CO₂e saved per transportation mode"
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
                      tickFormatter={v => `${v} kg`}
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
                title="Savings efficiency by mode"
                subtitle="kg CO₂e saved per km travelled; higher is better"
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
                      tickFormatter={v => `${v.toFixed(2)}`}
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
