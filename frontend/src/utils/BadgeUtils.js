/**
 * View mode constants for the Badges page toggle.
 * @type {Readonly<Object.<string, string>>}
 */
export const VIEWS = Object.freeze({
  ALL: 'all',
  EARNED: 'earned',
  IN_PROGRESS: 'inProgress',
})

/**
 * DB category values — snake_case matches badge.category from the API.
 * Keeps raw DB strings confined to a single definition.
 * @type {Readonly<Object.<string, string>>}
 */
export const CATEGORIES = Object.freeze({
  ECO_IMPACT: 'eco_impact',
  TRIPS: 'trips',
  MODES: 'modes',
  SOCIAL: 'social',
})

/**
 * Display order for badge categories on the Badges page.
 * @type {string[]}
 */
export const CATEGORY_ORDER = [
  CATEGORIES.ECO_IMPACT,
  CATEGORIES.TRIPS,
  CATEGORIES.MODES,
  CATEGORIES.SOCIAL,
]

/**
 * Returns the progress bar fill percentage as a CSS width string, from 0–100.
 *
 * @param {number} progress Fraction between 0 and 1.
 * @returns {string}        CSS width percentage string
 */
export function progressWidth(progress) {
  return `${Math.min(Math.max(progress ?? 0, 0), 1) * 100}%`
}

/**
 * Maps a camelCase alias to raw DB metric key values.

 * @type {Readonly<Object.<string, string>>}
 */
const METRIC_KEYS = Object.freeze({
  co2SavedKg: 'co2_saved_kg',
  tripCount: 'trip_count',
  modeTrips: 'mode_trips',
  routesCreated: 'routes_created',
})

/**
 * Maps badge metric keys to their display unit labels.
 * @type {Readonly<Object.<string, string>>}
 */
const METRIC_UNITS = Object.freeze({
  [METRIC_KEYS.co2SavedKg]: 'kg',
  [METRIC_KEYS.tripCount]: 'trips',
  [METRIC_KEYS.modeTrips]: 'trips',
  [METRIC_KEYS.routesCreated]: 'routes',
})

/**
 * Returns the display unit label for a badge metric type.
 *
 * @param {string} metric Badge metric key from the DB.
 * @returns {string}      Unit label e.g. "kg", "trips", "routes". Empty string if unknown.
 */
export function metricUnit(metric) {
  return METRIC_UNITS[metric] ?? ''
}

/**
 * Maps each view mode to a filter and sort function.
 * @type {Object.<string, function(Object[]): Object[]>}
 */
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

/**
 * Returns badges filtered and sorted for the given view.
 *
 * - ALL:         returns all badges as-is
 * - EARNED:      sorted by dateEarned descending
 * - IN_PROGRESS: sorted by progress descending
 *
 * @param {Object[]} badges Full badge array.
 * @param {string}   view   One of the views.
 * @returns {Object[]}
 */
export function filterForView(badges, view) {
  return (VIEW_FILTERS[view] ?? (badges => badges))(badges)
}
