/**
 * Shared Recharts configuration for analytics pages.
 * Note for future dev use:
 * -Recharts reads colours as JS strings, so CSS variables cannot be used directly.
 */
import { TransportMode } from '../../../shared/TransportModes'

export const THEME_COLORS = {
  blue: '#6fa4ea',
  purple: '#7c3aed',
  orange: '#feac7a',
  green: '#2e7d32',
  teal: '#0d9488',
  grey: '#b3b3b3',
  textSecondary: '#666666',
  lightGrey: '#e2e2e2',
}

/** @type {Object.<string, string>} */
export const MODE_COLORS = Object.fromEntries(
  Object.values(TransportMode).map(m => [m.key, m.themeColor])
)

/** @type {Object.<string, string>} */
export const MODE_LABELS = Object.fromEntries(
  Object.values(TransportMode).map(m => [m.key, m.label])
)

export const AXIS_TICK_STYLE = {
  fontSize: 12,
  fill: THEME_COLORS.textSecondary,
}
export const GRID_STYLE = {
  strokeDasharray: '3 3',
  stroke: THEME_COLORS.lightGrey,
}
