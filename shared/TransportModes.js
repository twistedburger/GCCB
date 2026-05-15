/**
 * Analytics transport mode categories.
 *
 * Dev Note: RAIL is an internal analytics category only. Users select
 * "Transit" when creating a route; rail vs. transit (bus) distinction
 * is resolved from Google Maps path segment data at calculation time.
 *
 * @type {Readonly<Object.<string, { key: string, label: string, themeColor: string }>>}
 */
const TransportMode = Object.freeze({
  WALK: { key: 'walk', label: 'Walk', themeColor: '#6fa4ea' },
  BICYCLE: { key: 'bicycle', label: 'Bicycle', themeColor: '#7c3aed' },
  TRANSIT: { key: 'transit', label: 'Transit', themeColor: '#feac7a' },
  RAIL: { key: 'rail', label: 'Rail', themeColor: '#0d9488' },
  CAR: { key: 'car', label: 'Car / Carpool', themeColor: '#2e7d32' },
  OTHER: { key: 'other', label: 'Other', themeColor: '#b3b3b3' },
})

module.exports = { TransportMode }
