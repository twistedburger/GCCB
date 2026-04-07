import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import PropTypes from 'prop-types'
import AnalyticsBlock from '../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../components/analytics/KpiGrid'
import ChartCard from '../../components/analytics/ChartCard'
import GenericButton from '../../components/GenericButton'
import {
  AXIS_TICK_STYLE,
  GRID_STYLE,
  THEME_COLORS,
} from '../../utils/ChartConfig'
import { analyticsStrings } from '../../locales/en/AnalyticsStrings'

const activityStrings = analyticsStrings.activity

const STATUS_COLORS = {
  upcoming: THEME_COLORS.blue,
  completed: THEME_COLORS.green,
  rejected: THEME_COLORS.orange,
}

const GRANULARITIES = ['daily', 'monthly', 'quarterly']

/**
 * Displays the status tooltip if payload is active and valid.
 *
 * @param {Object} params Active status and payload
 * @returns {JSX.Element}
 */
function StatusTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-zinc-800">{row.label}</p>
      <p className="text-zinc-600">
        {row.count} {row.count === 1 ? 'route' : 'routes'}
      </p>
    </div>
  )
}

StatusTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      payload: PropTypes.shape({
        label: PropTypes.string,
        count: PropTypes.number,
      }),
    })
  ),
}

/**
 * Displays the rejection tooltip if payload is active and valid.
 *
 * @param {Object} params Active status and payload
 * @returns {JSX.Element}
 */
function RejectionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-zinc-800">{row.reason}</p>
      <p className="text-zinc-600">
        {row.count} {row.count === 1 ? 'route' : 'routes'}
      </p>
    </div>
  )
}

RejectionTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      payload: PropTypes.shape({
        reason: PropTypes.string,
        count: PropTypes.number,
      }),
    })
  ),
}

/**
 * Displays the timeseries tooltip if payload is active and valid. Displays with label
 *
 * @param {Object} params Active status, payload, and label
 * @returns {JSX.Element}
 */
function TimeseriesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-zinc-800 mb-1">{label}</p>
      {payload.map(entry => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(2)} kg
        </p>
      ))}
    </div>
  )
}

TimeseriesTooltip.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.string,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      color: PropTypes.string,
    })
  ),
}

/**
 * Activity page
 *
 * @returns {JSX.Element}
 */
function Activity() {
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [timeseriesAll, setTimeseriesAll] = useState({
    daily: [],
    monthly: [],
    quarterly: [],
  })
  const [timeseriesLoading, setTimeseriesLoading] = useState(false)
  const [granularity, setGranularity] = useState('daily')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch('http://localhost:3000/api/activity/summary', {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch activity summary')
        setData(await res.json())
      } catch (err) {
        console.error('Failed to load activity summary', err)
        setError('Failed to load activity data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchAllTimeseries() {
      try {
        setTimeseriesLoading(true)
        const [daily, monthly, quarterly] = await Promise.all(
          GRANULARITIES.map(g =>
            fetch(
              `http://localhost:3000/api/activity/co2-timeseries?granularity=${g}`,
              { credentials: 'include' }
            ).then(res => {
              if (!res.ok) throw new Error(`Failed to fetch ${g} timeseries`)
              return res.json()
            })
          )
        )
        setTimeseriesAll({
          daily: daily.data ?? [],
          monthly: monthly.data ?? [],
          quarterly: quarterly.data ?? [],
        })
      } catch (err) {
        console.error('Failed to load time-series data', err)
      } finally {
        setTimeseriesLoading(false)
      }
    }
    fetchAllTimeseries()
  }, [])

  const kpis = [
    {
      label: activityStrings.kpis.activeCreators7d,
      value: loading ? '...' : `${data?.kpis.activeCreators7d ?? 0}`,
      subvalue: activityStrings.kpis.activeCreators7dSub,
    },
    {
      label: activityStrings.kpis.completionRate30d,
      value: loading ? '...' : `${data?.kpis.completionRate30d ?? 0}%`,
      subvalue: activityStrings.kpis.completionRate30dSub,
    },
    {
      label: activityStrings.kpis.rejectedRoutes30d,
      value: loading ? '...' : `${data?.kpis.rejectedRoutes30d ?? 0}`,
      subvalue: activityStrings.kpis.rejectedRoutes30dSub,
    },
    {
      label: activityStrings.kpis.avgGroupSize,
      value: loading ? '...' : `${data?.kpis.avgGroupSize ?? 0}`,
      subvalue: activityStrings.kpis.avgGroupSizeSub,
    },
  ]

  const statusChartData = data
    ? [
        {
          label: 'Upcoming',
          count: data.statusBreakdown.upcoming,
          fill: STATUS_COLORS.upcoming,
        },
        {
          label: 'Completed',
          count: data.statusBreakdown.completed,
          fill: STATUS_COLORS.completed,
        },
        {
          label: 'Rejected',
          count: data.statusBreakdown.rejected,
          fill: STATUS_COLORS.rejected,
        },
      ]
    : []

  const rejectionChartData = data?.rejectionReasons ?? []
  const activeTimeseriesData = timeseriesAll[granularity]

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
        <h1 className="text-2xl font-semibold">{activityStrings.pageTitle}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {activityStrings.pageDescription}
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col">
        <AnalyticsBlock
          title={activityStrings.blocks.atAGlance.title}
          description={activityStrings.blocks.atAGlance.description}
        >
          <KpiGrid items={kpis} />
        </AnalyticsBlock>

        <AnalyticsBlock
          title={activityStrings.blocks.statusBreakdown.title}
          description={activityStrings.blocks.statusBreakdown.description}
        >
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              {activityStrings.blocks.statusBreakdown.loading}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <ChartCard
                title={activityStrings.charts.statusBreakdown.title}
                subtitle={activityStrings.charts.statusBreakdown.subtitle}
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={statusChartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid {...GRID_STYLE} vertical={false} />
                    <XAxis dataKey="label" tick={AXIS_TICK_STYLE} />
                    <YAxis
                      tick={AXIS_TICK_STYLE}
                      width={40}
                      allowDecimals={false}
                    />
                    <Tooltip content={<StatusTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="fill" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title={activityStrings.charts.rejectionReasons.title}
                subtitle={activityStrings.charts.rejectionReasons.subtitle}
              >
                {rejectionChartData.length === 0 ? (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                    {activityStrings.charts.rejectionReasons.empty}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={rejectionChartData}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid {...GRID_STYLE} horizontal={false} />
                      <XAxis
                        type="number"
                        tick={AXIS_TICK_STYLE}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="reason"
                        tick={AXIS_TICK_STYLE}
                        width={120}
                      />
                      <Tooltip content={<RejectionTooltip />} />
                      <Bar
                        dataKey="count"
                        radius={[0, 6, 6, 0]}
                        fill={STATUS_COLORS.rejected}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          )}
        </AnalyticsBlock>

        <AnalyticsBlock
          title={activityStrings.blocks.co2OverTime.title}
          description={activityStrings.blocks.co2OverTime.description}
        >
          <div className="mb-4 flex gap-2">
            {GRANULARITIES.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition-colors
                  ${
                    granularity === g
                      ? 'bg-blue-primary text-white'
                      : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
              >
                {g}
              </button>
            ))}
          </div>

          <ChartCard
            title={activityStrings.charts.timeseries.title}
            subtitle={activityStrings.charts.timeseries.subtitle}
          >
            {timeseriesLoading ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                {activityStrings.charts.timeseries.loading}
              </div>
            ) : activeTimeseriesData.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                {activityStrings.charts.timeseries.empty}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={activeTimeseriesData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="period" tick={AXIS_TICK_STYLE} />
                  <YAxis
                    tick={AXIS_TICK_STYLE}
                    width={60}
                    tickFormatter={v => `${v} kg`}
                  />
                  <Tooltip content={<TimeseriesTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="baselineKg"
                    name="Baseline"
                    stroke={THEME_COLORS.orange}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualKg"
                    name="Actual"
                    stroke={THEME_COLORS.blue}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </AnalyticsBlock>
      </div>
    </div>
  )
}

export default Activity
