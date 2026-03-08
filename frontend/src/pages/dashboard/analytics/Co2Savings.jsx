import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnalyticsBlock from '../../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../../components/analytics/KpiGrid'
import DropDownList from '../../../components/DropDownList'
import GenericButton from '../../../components/GenericButton'
import { formatKg, formatKm } from '../../../utils/analyticsHelpers'
import { adminAnalyticsEn } from '../../../locales/adminAnalytics.en'

function Co2Savings() {
  const navigate = useNavigate()

  const [summary, setSummary] = useState(null)
  const [byMode, setByMode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMode, setSelectedMode] = useState('all')

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
  const activeMetrics = useMemo(() => {
    const modeData = byMode?.data ?? []
    if (!summary) {
      return {
        tripCount: 0,
        totalDistanceKm: 0,
        totalCo2SavedKg: 0,
        avgCo2PerTripKg: 0,
      }
    }

    if (selectedMode === 'all') {
      const tripCount = summary.tripCount ?? 0
      const totalDistanceKm = summary.totalDistanceKm ?? 0
      const totalCo2SavedKg = summary.totalCo2SavedKg ?? 0
      const avgCo2PerTripKg = tripCount > 0 ? totalCo2SavedKg / tripCount : 0

      return {
        tripCount,
        totalDistanceKm,
        totalCo2SavedKg,
        avgCo2PerTripKg,
      }
    }

    const selectedModeData = modeData.find(item => item.mode === selectedMode)

    if (!selectedModeData) {
      return {
        tripCount: 0,
        totalDistanceKm: 0,
        totalCo2SavedKg: 0,
        avgCo2PerTripKg: 0,
      }
    }

    const tripCount = selectedModeData.tripCount ?? 0
    const totalDistanceKm = selectedModeData.totalDistanceKm ?? 0
    const totalCo2SavedKg = selectedModeData.totalCo2SavedKg ?? 0
    const avgCo2PerTripKg = tripCount > 0 ? totalCo2SavedKg / tripCount : 0

    return {
      tripCount,
      totalDistanceKm,
      totalCo2SavedKg,
      avgCo2PerTripKg,
    }
  }, [summary, byMode?.data, selectedMode])

  const kpis = isAdmin
    ? [
        {
          label: 'Community CO₂e Saved',
          value: loading ? '...' : formatKg(activeMetrics.totalCo2SavedKg),
        },
        {
          label: 'Avg CO₂e Saved / Trip',
          value: loading ? '...' : formatKg(activeMetrics.avgCo2PerTripKg),
        },
        {
          label: 'Trips Included',
          value: loading ? '...' : `${activeMetrics.tripCount}`,
        },
        {
          label: 'Distance Included',
          value: loading ? '...' : formatKm(activeMetrics.totalDistanceKm),
        },
      ]
    : [
        {
          label: 'Personal CO₂e Saved',
          value: loading ? '...' : formatKg(activeMetrics.totalCo2SavedKg),
        },
        {
          label: 'Avg CO₂e Saved / Trip',
          value: loading ? '...' : formatKg(activeMetrics.avgCo2PerTripKg),
        },
        {
          label: 'Trips Included',
          value: loading ? '...' : `${activeMetrics.tripCount}`,
        },
        {
          label: 'Distance Included',
          value: loading ? '...' : formatKm(activeMetrics.totalDistanceKm),
        },
      ]

  function formatModeLabel(mode) {
    switch (mode) {
      case 'walk':
        return 'Walk'
      case 'bicycle':
        return 'Bicycle'
      case 'bus':
        return 'Bus / Transit'
      case 'car':
        return 'Car / Carpool'
      default:
        return mode
    }
  }

  const visibleModeRows = useMemo(() => {
    const modeData = byMode?.data ?? []

    return selectedMode === 'all'
      ? modeData.filter(row => row.tripCount > 0)
      : modeData.filter(row => row.mode === selectedMode)
  }, [byMode?.data, selectedMode])

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
            ? 'Review estimated emissions savings across all completed community trips.'
            : 'Review your estimated emissions savings across completed trips.'}
        </p>

        <p className="text-xs font-semibold">
          Note: These values are estimates intended for analytics and awareness,
          not exact real-world measurements.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col">
        <AnalyticsBlock title="Filter by Transportation Mode">
          <div className="flex flex-wrap items-center gap-3">
            <DropDownList
              items={['all', 'walk', 'bicycle', 'bus', 'car']}
              value={selectedMode}
              onChange={e => setSelectedMode(e.target.value)}
            />
          </div>
        </AnalyticsBlock>

        <AnalyticsBlock
          title="Key metrics"
          description="These values update based on the selected mode."
        >
          <KpiGrid items={kpis} />
        </AnalyticsBlock>

        <AnalyticsBlock
          title="How this is calculated"
          description="Estimated CO₂e savings are calculated relative to a baseline solo petrol car."
        >
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
            <div className="space-y-3">
              <p>
                Walking and cycling are compared against the emissions from one
                person driving the same distance in a solo petrol car.
              </p>

              <p>
                Bus and transit trips use a passenger-based emissions factor,
                then compare that estimate against the same solo-car baseline.
              </p>

              <p>
                Carpool trips compare one shared vehicle trip against the
                emissions that would have been produced if each participant
                drove separately.
              </p>
            </div>
          </div>
        </AnalyticsBlock>

        <AnalyticsBlock title="Savings by Mode">
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              Loading CO₂e breakdown...
            </div>
          ) : visibleModeRows.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              No CO₂e data is available for the selected mode.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleModeRows.map(row => {
                const avgSavedPerTrip =
                  row.tripCount > 0 ? row.totalCo2SavedKg / row.tripCount : 0

                return (
                  <div
                    key={row.mode}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-zinc-900">
                          {formatModeLabel(row.mode)}
                        </h3>

                        <p className="mt-1 text-sm text-zinc-600">
                          {row.tripCount} trips included in this category
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-zinc-700 sm:grid-cols-4">
                      <div>
                        <span className="font-medium">Trips:</span>{' '}
                        {row.tripCount}
                      </div>

                      <div>
                        <span className="font-medium">Distance:</span>{' '}
                        {formatKm(row.totalDistanceKm)}
                      </div>

                      <div>
                        <span className="font-medium">CO₂e Saved:</span>{' '}
                        {formatKg(row.totalCo2SavedKg)}
                      </div>

                      <div>
                        <span className="font-medium">Avg / Trip:</span>{' '}
                        {formatKg(avgSavedPerTrip)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </AnalyticsBlock>
      </div>
    </div>
  )
}

export default Co2Savings
