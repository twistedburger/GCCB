/**
 * Shared Recharts configuration for analytics pages.
 * Note for future dev use:
 * -Recharts reads colours as JS strings, so CSS variables cannot be used directly.
 */

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
  walk: THEME_COLORS.blue,
  bicycle: THEME_COLORS.purple,
  bus: THEME_COLORS.orange,
  rail: THEME_COLORS.teal,
  car: THEME_COLORS.green,
  other: THEME_COLORS.grey,
}

export const MODE_LABELS = {
  walk: 'Walk',
  bicycle: 'Bicycle',
  bus: 'Bus',
  rail: 'Rail',
  car: 'Car / Carpool',
  other: 'Other',
}

export const AXIS_TICK_STYLE = {
  fontSize: 12,
  fill: THEME_COLORS.textSecondary,
}
export const GRID_STYLE = {
  strokeDasharray: '3 3',
  stroke: THEME_COLORS.lightGrey,
}
