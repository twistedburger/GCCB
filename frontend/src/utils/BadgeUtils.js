export function progressWidth(progress) {
  return `${Math.min(Math.max(progress ?? 0, 0), 1) * 100}%`
}

const METRIC_UNITS = Object.freeze({
  co2_saved_kg: 'kg',
  trip_count: 'trips',
  mode_trips: 'trips',
  routes_created: 'routes',
  events_attended: 'events',
})

export function metricUnit(metric) {
  return METRIC_UNITS[metric] ?? ''
}
