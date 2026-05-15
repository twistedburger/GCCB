/**
 * Shared Recharts configuration for analytics pages.
 * Note for future dev use:
 * -Recharts reads colours as JS strings, so CSS variables cannot be used directly.
 */
import { TransportMode } from './TransportMode'

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

export const MODE_COLORS = {
  [TransportMode.WALK]: THEME_COLORS.blue,
  [TransportMode.BICYCLE]: THEME_COLORS.purple,
  [TransportMode.TRANSIT]: THEME_COLORS.orange,
  [TransportMode.RAIL]: THEME_COLORS.teal,
  [TransportMode.CAR]: THEME_COLORS.green,
  [TransportMode.OTHER]: THEME_COLORS.grey,
}

export const MODE_LABELS = {
  [TransportMode.WALK]: 'Walk',
  [TransportMode.BICYCLE]: 'Bicycle',
  [TransportMode.TRANSIT]: 'Transit',
  [TransportMode.RAIL]: 'Rail',
  [TransportMode.CAR]: 'Car / Carpool',
  [TransportMode.OTHER]: 'Other',
}

export const AXIS_TICK_STYLE = {
  fontSize: 12,
  fill: THEME_COLORS.textSecondary,
}
export const GRID_STYLE = {
  strokeDasharray: '3 3',
  stroke: THEME_COLORS.lightGrey,
}
