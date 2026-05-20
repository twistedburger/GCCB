import { TransportMode } from '../../../shared/TransportModes'

export function formatKg(value) {
  return `${Number(value ?? 0).toFixed(2)} kg`
}

export function formatKm(value) {
  return `${Number(value ?? 0).toFixed(2)} km`
}

export function getMostUsedMode(modes = {}) {
  const entries = Object.entries(modes)

  if (entries.length === 0) return 'N/A'

  const [mode, count] = entries.reduce(
    (best, current) => (current[1] > best[1] ? current : best),
    ['', 0]
  )

  if (count <= 0) return 'N/A'

  const labels = {
    ...Object.fromEntries(
      Object.values(TransportMode).map(mode => [mode.key, mode.label])
    ),
    [TransportMode.CAR.key]: 'Car', // shorter label for this context
  }

  return labels[mode] ?? 'N/A'
}
