import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnalyticsBlock from '../../components/analytics/AnalyticsBlock'
import KpiGrid from '../../components/analytics/KpiGrid'
import Select from 'react-select'
import GenericButton from '../../components/GenericButton'
import {
  formatKg,
  formatKm,
  getMostUsedMode,
} from '../../utils/analyticsHelpers'
import { adminAnalyticsEn } from '../../locales/adminAnalytics.en'

function TripFrequency() {
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
  const modeData = byMode?.data ?? []

  function formatModeLabel(mode) {
    switch (mode) {
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
      case 'other':
        return 'Other'
      default:
        return mode
    }
  }

  const visibleModeRows =
    selectedMode === 'all'
      ? modeData.filter(row => row.tripCount > 0)
      : modeData.filter(row => row.mode === selectedMode)

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

      <div>
        <h1 className="text-2xl font-semibold">
          {isAdmin ? 'Community Trip Frequency' : 'My Trip Frequency'}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          {isAdmin
            ? 'Review how transportation modes are used across completed community trips.'
            : 'Review how your completed trips are distributed by transportation mode.'}
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
                  label: formatModeLabel(r),
                }))}
                value={{
                  value: selectedMode,
                  label: formatModeLabel(selectedMode),
                }}
                onChange={e => setSelectedMode(e.value)}
                isDisabled={loading}
              />
            </div>
          </div>
        </AnalyticsBlock>

        <AnalyticsBlock
          title="Key metrics"
          description="These values reflect your overall completed-trip mode usage."
        >
          <KpiGrid items={kpis} />
        </AnalyticsBlock>

        <AnalyticsBlock
          title="Mode breakdown"
          description="Review trip count, distance, and savings across transportation modes."
        >
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              Loading trip frequency breakdown...
            </div>
          ) : visibleModeRows.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              No trip frequency data is available for the selected mode.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleModeRows.map(row => {
                const totalTrips = summary?.tripCount ?? 0
                const shareOfTrips =
                  totalTrips > 0
                    ? Math.round((row.tripCount / totalTrips) * 100)
                    : 0

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

                      <div className="text-sm text-zinc-500">
                        {shareOfTrips}% of trips
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-zinc-700 sm:grid-cols-3">
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

export default TripFrequency
