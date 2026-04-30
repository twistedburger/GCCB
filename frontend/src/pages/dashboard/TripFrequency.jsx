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
import { formatKm, getMostUsedMode } from '../../utils/AnalyticsHelpers'
import { analyticsStrings } from '../../locales/en/AnalyticsStrings'

const tripStrings = analyticsStrings.tripFrequency
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
      totalDistanceKm: PropTypes.number,
      avgDistancePerTrip: PropTypes.number,
    }),
  })
)

/**
 * Displays the trip bar tooltip if payload is active and valid.
 *
 * @param {Object} params Active status and payload
 * @returns {JSX.Element}
 */
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

/**
 * Displays the average distance tooltip if payload is active and valid.
 *
 * @param {Object} params Active status and payload
 * @returns {JSX.Element}
 */
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

/**
 * Trip Frequency Page
 * @returns {JSX.Element}
 */
function TripFrequency() {
  const navigate = useNavigate()

  const [summary, setSummary] = useState(null)
  const [byMode, setByMode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const baseURL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError('')

        const [summaryRes, byModeRes] = await Promise.all([
          fetch(`${baseURL}/api/analytics/summary`, {
            credentials: 'include',
          }),
          fetch(`${baseURL}/api/analytics/by-mode`, {
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin = summary?.scope === 'system'

  const chartData = useMemo(() => {
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
          label: tripStrings.kpis.mostUsedMode,
          value: loading ? '...' : overallMetrics.mostUsedMode,
        },
        {
          label: tripStrings.kpis.communityTrips,
          value: loading ? '...' : `${overallMetrics.tripCount}`,
        },
        {
          label: tripStrings.kpis.communityDistance,
          value: loading ? '...' : formatKm(overallMetrics.totalDistanceKm),
        },
      ]
    : [
        {
          label: tripStrings.kpis.mostUsedMode,
          value: loading ? '...' : overallMetrics.mostUsedMode,
        },
        {
          label: tripStrings.kpis.totalTrips,
          value: loading ? '...' : `${overallMetrics.tripCount}`,
        },
        {
          label: tripStrings.kpis.totalDistance,
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
        {analyticsStrings.common.back}
      </GenericButton>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {isAdmin ? tripStrings.pageTitle.admin : tripStrings.pageTitle.user}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          {isAdmin
            ? tripStrings.pageDescription.admin
            : tripStrings.pageDescription.user}
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col">
        <AnalyticsBlock
          title={tripStrings.blocks.atAGlance.title}
          description={
            isAdmin
              ? tripStrings.blocks.atAGlance.descriptionAdmin
              : tripStrings.blocks.atAGlance.descriptionUser
          }
        >
          <KpiGrid items={kpis} />
        </AnalyticsBlock>

        <AnalyticsBlock
          title={tripStrings.blocks.byMode.title}
          description={tripStrings.blocks.byMode.description}
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
                title={tripStrings.charts.byMode.title}
                subtitle={tripStrings.charts.byMode.subtitle}
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
                title={tripStrings.charts.avgDistance.title}
                subtitle={tripStrings.charts.avgDistance.subtitle}
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
          title={tripStrings.blocks.whyItMatters.title}
          description={tripStrings.blocks.whyItMatters.description}
        >
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
            <div className="space-y-3">
              <p>
                {isAdmin
                  ? tripStrings.blocks.whyItMatters.bodyAdmin
                  : tripStrings.blocks.whyItMatters.bodyUser}
              </p>
              <p className="text-zinc-500">
                {tripStrings.blocks.whyItMatters.footnote}
              </p>
            </div>
          </div>
        </AnalyticsBlock>
      </div>
    </div>
  )
}

export default TripFrequency
