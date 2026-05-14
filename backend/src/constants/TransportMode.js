/**
 * Analytics transport mode categories.
 *
 * Dev Note: RAIL is an internal analytics category only. Users select
 * "Transit" when creating a route; rail vs. transit (bus) distinction
 * is resolved from Google Maps path segment data at calculation time.
 *
 * @type {Readonly<Object.<string, string>>}
 */
const TransportMode = Object.freeze({
  WALK: 'walk',
  BICYCLE: 'bicycle',
  TRANSIT: 'transit',
  RAIL: 'rail',
  CAR: 'car',
  OTHER: 'other',
})

module.exports = { TransportMode }
