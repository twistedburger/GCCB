import { adminAnalyticsEn } from '../../locales/adminAnalytics.en'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnalyticsBlock from '../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../components/analytics/KpiGrid'
import Select from 'react-select'
import GenericButton from '../../components/GenericButton'
import { formatKg, formatKm } from '../../utils/AnalyticsHelpers'

/**
 * Commutes Page
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
          'http://localhost:3000/api/commute-history',
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

  function normalizeMode(rawMode) {
    if (!rawMode) return 'other'

    const value = String(rawMode).trim().toLowerCase()

    if (['walk', 'walking'].includes(value)) return 'walk'
    if (['bicycle', 'bike', 'cycling', 'cycle', 'bicycling'].includes(value)) {
      return 'bicycle'
    }
    if (['bus', 'transit', 'intercity_bus', 'trolleybus'].includes(value)) {
      return 'bus'
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
      return 'rail'
    }
    if (['car', 'carpool', 'drive', 'driving'].includes(value)) return 'car'

    return 'other'
  }

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
        mode === 'all' || normalizeMode(route.transportation_mode) === mode

      const matchesDate = isWithinDateRange(route.depart_time, dateRange)

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
    { label: 'Trips', value: loading ? '...' : `${tripCount}` },
    {
      label: 'Total Distance',
      value: loading ? '...' : formatKm(totalDistanceKm),
    },
    {
      label: 'Avg Distance / Trip',
      value: loading ? '...' : formatKm(avgDistancePerRouteKm),
    },
    {
      label: 'Personal CO₂e Saved',
      value: loading ? '...' : formatKg(totalCo2SavedKg),
    },
  ]

  function formatDepartTime(value) {
    if (!value) return 'No departure time'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return 'Invalid date'
    }

    return date.toLocaleString()
  }

  function formatRouteMode(value) {
    const normalized = normalizeMode(value)

    switch (normalized) {
      case 'walk':
        return 'Walk'
      case 'bicycle':
        return 'Bicycle'
      case 'bus':
        return 'Bus'
      case 'rail':
        return 'Rail'
      case 'car':
        return 'Car / Carpool'
      default:
        return 'Other'
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
        {adminAnalyticsEn.common.back}
      </GenericButton>

      <div>
        <h1 className="text-2xl font-semibold">My Commutes</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Review the completed trips included in your commute metrics.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col">
        <AnalyticsBlock title="Filters">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold text-zinc-700">
                Date range
              </label>
              <Select
                options={['all', '7d', '30d'].map(r => ({
                  value: r,
                  label: r,
                }))}
                value={{ value: dateRange, label: dateRange }}
                onChange={e => setDateRange(e.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold text-zinc-700">
                Transportation mode
              </label>
              <Select
                options={[
                  'all',
                  'walk',
                  'bicycle',
                  'bus',
                  'rail',
                  'car',
                  'other',
                ].map(r => ({
                  value: r,
                  label:
                    r === 'all'
                      ? 'All'
                      : r === 'walk'
                        ? 'Walk'
                        : r === 'bicycle'
                          ? 'Bicycle'
                          : r === 'bus'
                            ? 'Bus'
                            : r === 'rail'
                              ? 'Rail'
                              : r === 'car'
                                ? 'Car / Carpool'
                                : 'Other',
                }))}
                value={{ value: mode, label: mode }}
                onChange={e => setMode(e.value)}
              />
            </div>
          </div>
        </AnalyticsBlock>

        <AnalyticsBlock title="Key metrics">
          <KpiGrid items={kpis} />
        </AnalyticsBlock>

        <AnalyticsBlock title="Commute history">
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              Loading commute history...
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              No completed trips match the selected filters.
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
                        {route.title || 'Untitled commute'}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-600">
                        {route.origin || 'Unknown origin'} →{' '}
                        {route.destination || 'Unknown destination'}
                      </p>

                      {route.description ? (
                        <p className="mt-2 text-sm text-zinc-500">
                          {route.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="text-sm text-zinc-500">
                      {formatDepartTime(route.depart_time)}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-zinc-700 sm:grid-cols-3">
                    <div>
                      <span className="font-medium">Mode:</span>{' '}
                      {formatRouteMode(route.transportation_mode)}
                    </div>

                    <div>
                      <span className="font-medium">Distance:</span>{' '}
                      {formatKm(Number(route.distance ?? 0))}
                    </div>

                    <div>
                      <span className="font-medium">CO₂e Saved:</span>{' '}
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
