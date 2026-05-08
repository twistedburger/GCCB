export const CATEGORIES = Object.freeze({
  ECO_IMPACT: 'eco_impact',
  TRIPS: 'trips',
  MODES: 'modes',
  SOCIAL: 'social',
  EVENTS: 'events',
})

export const CATEGORY_ORDER = [
  CATEGORIES.ECO_IMPACT,
  CATEGORIES.TRIPS,
  CATEGORIES.MODES,
  CATEGORIES.SOCIAL,
  CATEGORIES.EVENTS,
]

export const VIEWS = Object.freeze({
  ALL: 'all',
  EARNED: 'earned',
  IN_PROGRESS: 'inProgress',
})

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

const VIEW_FILTERS = {
  [VIEWS.EARNED]: badges =>
    [...badges]
      .filter(badge => badge.earned)
      .sort(
        (badgeA, badgeB) =>
          new Date(badgeB.dateEarned) - new Date(badgeA.dateEarned)
      ),

  [VIEWS.IN_PROGRESS]: badges =>
    [...badges]
      .filter(badge => !badge.earned && (badge.currentValue ?? 0) > 0)
      .sort(
        (badgeA, badgeB) => (badgeB.progress ?? 0) - (badgeA.progress ?? 0)
      ),
}

export function filterForView(badges, view) {
  return (VIEW_FILTERS[view] ?? (badges => badges))(badges)
}
