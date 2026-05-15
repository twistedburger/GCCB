import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnalyticsBlock from '../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../components/analytics/KpiGrid'
import Select from 'react-select'
import GenericButton from '../../components/GenericButton'
import { formatKg, formatKm } from '../../utils/AnalyticsHelpers'
import { analyticsStrings } from '../../locales/en/AnalyticsStrings'
import { TransportMode } from '../../utils/TransportMode'

const commuteStrings = analyticsStrings.commutes

/**
 * Commutes History Page
 * @returns {JSX.Element}
 */
function Commutes() {
  const navigate = useNavigate()
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [dateRange, setDateRange] = useState('all')
  const [mode, setMode] = useState('all')

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/commute-history`,
          {
            credentials: 'include',
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch commute history: ${response.status}`)
        }

        const data = await response.json()
        setHistory(data)
      } catch (err) {
        console.error('Failed to load commute history', err)
        setError('Failed to load commute history.')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  /**
   * Normalizes a raw mode input into a predefined category.
   * @param {string} rawMode The raw input that represents a mode of transportation
   * @returns {string} A normalized mode string, which can be one of: "walk", "bicycle",
   * "bus", "rail", "car", or "other".
   */
  function normalizeMode(rawMode) {
    if (!rawMode) return TransportMode.OTHER

    const value = String(rawMode).trim().toLowerCase()

    if (['walk', 'walking'].includes(value)) return TransportMode.WALK
    if (['bicycle', 'bike', 'cycling', 'cycle', 'bicycling'].includes(value)) {
      return TransportMode.BICYCLE
    }
    if (['bus', 'transit', 'intercity_bus', 'trolleybus'].includes(value)) {
      return TransportMode.TRANSIT
    }
    if (
      [
        'rail',
        'train',
        'skytrain',
        'subway',
        'light_rail',
        'tram',
        'metro_rail',
        'commuter_train',
        'heavy_rail',
        'high_speed_train',
        'long_distance_train',
        'monorail',
      ].includes(value)
    ) {
      return TransportMode.RAIL
    }
    if (['car', 'carpool', 'drive', 'driving'].includes(value))
      return TransportMode.CAR

    return TransportMode.OTHER
  }

  /**
   * Checks if a departure time falls within a specified date range.
   *
   * @param {string} departTime The departure time as a date string or object
   * @param {string} selectedRange The selected date range (all, 7d, or 30d)
   * @returns {boolean} true if the departure time is within the specified range; otherwise false.
   */
  function isWithinDateRange(departTime, selectedRange) {
    if (selectedRange === 'all') return true
    if (!departTime) return false

    const routeDate = new Date(departTime)
    const now = new Date()

    if (Number.isNaN(routeDate.getTime())) {
      return false
    }

    if (selectedRange === '7d') {
      const cutoff = new Date(now)
      cutoff.setDate(now.getDate() - 7)
      return routeDate >= cutoff
    }

    if (selectedRange === '30d') {
      const cutoff = new Date(now)
      cutoff.setDate(now.getDate() - 30)
      return routeDate >= cutoff
    }

    return true
  }

  const filteredRoutes = useMemo(() => {
    const routes = history?.routes ?? []

    return routes.filter(route => {
      const matchesMode =
        mode === 'all' || normalizeMode(route.transportationMode) === mode

      const matchesDate = isWithinDateRange(route.departTime, dateRange)

      return matchesMode && matchesDate
    })
  }, [history?.routes, mode, dateRange])

  const tripCount = filteredRoutes.length

  const totalDistanceKm = filteredRoutes.reduce(
    (sum, route) => sum + Number(route.distance ?? 0),
    0
  )

  const avgDistancePerRouteKm = tripCount > 0 ? totalDistanceKm / tripCount : 0

  const totalCo2SavedKg = filteredRoutes.reduce((sum, route) => {
    return sum + Number(route.savedKgUser ?? 0)
  }, 0)

  const kpis = [
    {
      label: commuteStrings.kpis.trips,
      value: loading ? '...' : `${tripCount}`,
    },
    {
      label: commuteStrings.kpis.totalDistance,
      value: loading ? '...' : formatKm(totalDistanceKm),
    },
    {
      label: commuteStrings.kpis.avgDistance,
      value: loading ? '...' : formatKm(avgDistancePerRouteKm),
    },
    {
      label: commuteStrings.kpis.co2Saved,
      value: loading ? '...' : formatKg(totalCo2SavedKg),
    },
  ]

  /**
   * Formats a departure time value into a readable string.
   *
   * @param {string} dateValue The departure time as a date string or object.
   * @returns {string} A formatted date string.
   */
  function formatDepartTime(dateValue) {
    if (!dateValue) return commuteStrings.history.noDepartTime

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return commuteStrings.history.invalidDate
    }

    return date.toLocaleString()
  }

  /**
   * Formats a route mode value into a string.
   * @param {string} modeValue The raw route mode value
   * @returns {string} A string representing the route mode.
   */
  function formatRouteMode(modeValue) {
    const normalized = normalizeMode(modeValue)

    switch (normalized) {
      case TransportMode.WALK:
        return commuteStrings.route.modes.walk
      case TransportMode.BICYCLE:
        return commuteStrings.route.modes.bicycle
      case TransportMode.TRANSIT:
        return commuteStrings.route.modes.bus
      case TransportMode.RAIL:
        return commuteStrings.route.modes.rail
      case TransportMode.CAR:
        return commuteStrings.route.modes.car
      default:
        return commuteStrings.route.modes.other
    }
  }

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

      <div>
        <h1 className="text-2xl font-semibold">{commuteStrings.pageTitle}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {commuteStrings.pageDescription}
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col">
        <AnalyticsBlock title={commuteStrings.blocks.filters.title}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold text-zinc-700">
                {commuteStrings.blocks.filters.dateRangeLabel}
              </label>
              <Select
                options={['all', '7d', '30d'].map(rangeOption => ({
                  value: rangeOption,
                  label: rangeOption,
                }))}
                value={{ value: dateRange, label: dateRange }}
                onChange={e => setDateRange(e.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold text-zinc-700">
                {commuteStrings.blocks.filters.modeLabel}
              </label>
              <Select
                options={['all', ...Object.values(TransportMode)].map(
                  modeOption => ({
                    value: modeOption,
                    label:
                      modeOption === 'all'
                        ? commuteStrings.route.modes.all
                        : modeOption === TransportMode.WALK
                          ? commuteStrings.route.modes.walk
                          : modeOption === TransportMode.BICYCLE
                            ? commuteStrings.route.modes.bicycle
                            : modeOption === TransportMode.TRANSIT
                              ? commuteStrings.route.modes.bus
                              : modeOption === TransportMode.RAIL
                                ? commuteStrings.route.modes.rail
                                : modeOption === TransportMode.CAR
                                  ? commuteStrings.route.modes.car
                                  : commuteStrings.route.modes.other,
                  })
                )}
                value={{ value: mode, label: mode }}
                onChange={e => setMode(e.value)}
              />
            </div>
          </div>
        </AnalyticsBlock>

        <AnalyticsBlock title={commuteStrings.blocks.keyMetrics.title}>
          <KpiGrid items={kpis} />
        </AnalyticsBlock>

        <AnalyticsBlock title={commuteStrings.blocks.history.title}>
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              {commuteStrings.blocks.history.loading}
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              {commuteStrings.blocks.history.empty}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredRoutes.map(route => (
                <div
                  key={route.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-zinc-900">
                        {route.title || commuteStrings.blocks.history.untitled}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-600">
                        {route.origin ||
                          commuteStrings.blocks.history.unknownOrigin}{' '}
                        →{' '}
                        {route.destination ||
                          commuteStrings.blocks.history.unknownDestination}
                      </p>

                      {route.description ? (
                        <p className="mt-2 text-sm text-zinc-500">
                          {route.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="text-sm text-zinc-500">
                      {formatDepartTime(route.departTime)}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-zinc-700 sm:grid-cols-3">
                    <div>
                      <span className="font-medium">
                        {commuteStrings.route.mode}:
                      </span>{' '}
                      {formatRouteMode(route.transportationMode)}
                    </div>

                    <div>
                      <span className="font-medium">
                        {commuteStrings.route.distance}:
                      </span>{' '}
                      {formatKm(Number(route.distance ?? 0))}
                    </div>

                    <div>
                      <span className="font-medium">
                        {commuteStrings.route.co2Saved}:
                      </span>{' '}
                      {formatKg(Number(route.savedKgUser ?? 0))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnalyticsBlock>
      </div>
    </div>
  )
}

export default Commutes
