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
import GenericButton from '../../components/GenericButton'
import { formatKm, getMostUsedMode } from '../../utils/analyticsHelpers'
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
      totalDistanceKm: PropTypes.number,
      avgDistancePerTrip: PropTypes.number,
    }),
  })
)

function TripBarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-zinc-800">{row.label}</p>
      <p className="text-zinc-600">
        {row.tripCount} {row.tripCount === 1 ? 'trip' : 'trips'}
      </p>
      <p className="text-zinc-500">{row.totalDistanceKm.toFixed(2)} km total</p>
    </div>
  )
}

TripBarTooltip.propTypes = {
  active: PropTypes.bool,
  payload: tooltipPayloadShape,
}

function AvgDistanceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-zinc-800">{row.label}</p>
      <p className="text-zinc-600">
        {row.avgDistancePerTrip.toFixed(2)} km avg / trip
      </p>
      <p className="text-zinc-500">
        {row.tripCount} {row.tripCount === 1 ? 'trip' : 'trips'} total
      </p>
    </div>
  )
}

AvgDistanceTooltip.propTypes = {
  active: PropTypes.bool,
  payload: tooltipPayloadShape,
}

function TripFrequency() {
  const navigate = useNavigate()

  const [summary, setSummary] = useState(null)
  const [byMode, setByMode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          throw new Error('Failed to fetch trip frequency analytics')
        }

        const [summaryData, byModeData] = await Promise.all([
          summaryRes.json(),
          byModeRes.json(),
        ])

        setSummary(summaryData)
        setByMode(byModeData)
      } catch (err) {
        console.error('Failed to load trip frequency analytics', err)
        setError('Failed to load trip frequency analytics.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const isAdmin = summary?.scope === 'system'

  // Chart data always shows all modes with data, regardless of the mode filter
  const allChartData = useMemo(() => {
    return (byMode?.data ?? [])
      .filter(row => row.tripCount > 0)
      .map(row => ({
        ...row,
        label: MODE_LABELS[row.mode] ?? row.mode,
        fill: MODE_COLORS[row.mode] ?? '#b3b3b3',
      }))
  }, [byMode?.data])

  // Avg distance per trip: modes with at least one trip, sorted longest to shortest
  const avgDistanceChartData = useMemo(() => {
    return (byMode?.data ?? [])
      .filter(row => row.tripCount > 0 && row.totalDistanceKm > 0)
      .map(row => ({
        ...row,
        label: MODE_LABELS[row.mode] ?? row.mode,
        fill: MODE_COLORS[row.mode] ?? '#b3b3b3',
        avgDistancePerTrip: row.totalDistanceKm / row.tripCount,
      }))
      .sort((a, b) => b.avgDistancePerTrip - a.avgDistancePerTrip)
  }, [byMode?.data])

  const overallMetrics = useMemo(() => {
    if (!summary) {
      return {
        mostUsedMode: 'N/A',
        tripCount: 0,
        totalDistanceKm: 0,
      }
    }

    const tripFrequencies = summary.tripFrequenciesByMode ?? {}

    return {
      mostUsedMode: getMostUsedMode(tripFrequencies),
      tripCount: summary.tripCount ?? 0,
      totalDistanceKm: summary.totalDistanceKm ?? 0,
    }
  }, [summary])

  const kpis = isAdmin
    ? [
        {
          label: 'Most Used Mode',
          value: loading ? '...' : overallMetrics.mostUsedMode,
        },
        {
          label: 'Community Trips',
          value: loading ? '...' : `${overallMetrics.tripCount}`,
        },
        {
          label: 'Community Distance',
          value: loading ? '...' : formatKm(overallMetrics.totalDistanceKm),
        },
      ]
    : [
        {
          label: 'Most Used Mode',
          value: loading ? '...' : overallMetrics.mostUsedMode,
        },
        {
          label: 'Total Trips',
          value: loading ? '...' : `${overallMetrics.tripCount}`,
        },
        {
          label: 'Total Distance',
          value: loading ? '...' : formatKm(overallMetrics.totalDistanceKm),
        },
      ]

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
          {isAdmin ? 'Community Trip Frequency' : 'My Trip Frequency'}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          {isAdmin
            ? 'See how students across the community are travelling. Which modes they use most, how far they go, and where the biggest opportunities to shift away from solo car trips still exist.'
            : "See how you're travelling; which modes you use most and how your choices compare across your completed trips."}
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col">
        <AnalyticsBlock
          title="At a glance"
          description={
            isAdmin
              ? 'Aggregate trip totals across all completed community routes.'
              : 'Your completed trip totals based on routes you participated in.'
          }
        >
          <KpiGrid items={kpis} />
        </AnalyticsBlock>

        <AnalyticsBlock
          title="Breakdown by mode"
          description="Each completed trip is counted once and assigned to its dominant transportation mode. Multi-mode routes (for example a walk to the bus stop followed by a bus ride) are attributed to whichever mode covered the most distance."
        >
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              Loading charts...
            </div>
          ) : allChartData.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              No chart data available yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <ChartCard
                title="Trips by mode"
                subtitle="Number of completed trips per transportation mode"
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={allChartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid {...GRID_STYLE} vertical={false} />
                    <XAxis dataKey="label" tick={AXIS_TICK_STYLE} />
                    <YAxis
                      tick={AXIS_TICK_STYLE}
                      width={40}
                      allowDecimals={false}
                    />
                    <Tooltip content={<TripBarTooltip />} />
                    <Bar
                      dataKey="tripCount"
                      radius={[6, 6, 0, 0]}
                      fill="fill"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Avg distance per trip by mode"
                subtitle="km per trip on average; longer trips suggest further commutes"
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={avgDistanceChartData}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid {...GRID_STYLE} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={AXIS_TICK_STYLE}
                      tickFormatter={v => `${v.toFixed(1)} km`}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={AXIS_TICK_STYLE}
                      width={72}
                    />
                    <Tooltip content={<AvgDistanceTooltip />} />
                    <Bar
                      dataKey="avgDistancePerTrip"
                      radius={[0, 6, 6, 0]}
                      fill="fill"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}
        </AnalyticsBlock>

        <AnalyticsBlock
          title="Why this matters"
          description="Understanding how people travel is the first step to reducing emissions!"
        >
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
            <div className="space-y-3">
              <p>
                {isAdmin
                  ? "Every trip that shifts away from driving alone reduces the community's collective carbon footprint. High walk, bicycle, and transit numbers here indicate the platform is achieving its core goal."
                  : 'Every trip you take by foot, bike, or transit instead of driving alone makes a real difference. As your most-used mode trends away from car, the greater your personal impact!'}
              </p>
              <p className="text-zinc-500">
                Trips are counted for completed routes only.
              </p>
            </div>
          </div>
        </AnalyticsBlock>
      </div>
    </div>
  )
}

export default TripFrequency
