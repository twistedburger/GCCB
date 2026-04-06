import axios from 'axios'

export const TravelMode = Object.freeze({
  Transit: 'TRANSIT',
  Carpool: 'DRIVE',
  Walk: 'WALK',
  Bike: 'BICYCLE',
})

export function isValidTravelMode(value) {
  return Object.values(TravelMode).includes(value)
}

/**
 *
 * @param {*} _origin origin location. prefer place id https://developers.google.com/maps/documentation/routes/specify_location?_gl=1*18yuyag*_up*MQ..*_ga*MTYyMTEwNzQwOS4xNzcyMzk1ODA4*_ga_SM8HXJ53K2*czE3NzIzOTU4MDgkbzEkZzAkdDE3NzIzOTc0ODckajYwJGwwJGgw*_ga_NRWSTWS78N*czE3NzIzOTU4MDgkbzEkZzEkdDE3NzIzOTgxMjQkajYwJGwwJGgw#place_id
 * @param {*} _destination destination location. prefer place id
 * @param {*} _travelMode TravelMode enum
 * @param {*} param3 times specified in format "yyyy-mm-ddThh:mm:ssZ". Optional
 */
export async function calculateRoute(
  _origin,
  _destination,
  _travelMode,
  { _arrivalTime, _departureTime } = {}
) {
  if (!isValidTravelMode(_travelMode)) {
    throw new Error('Invalid travel mode')
  }

  const routeBody = {
    origin: _origin,
    destination: _destination,
    travelMode: _travelMode,
    computeAlternativeRoutes: false,
    languageCode: 'en-US',
    units: 'METRIC',
  }

  if (_travelMode === 'DRIVE' && (_departureTime || _arrivalTime)) {
    routeBody.routingPreference = 'TRAFFIC_AWARE'
  }

  //Note that arrival time will superceed departure time, if both are specified
  if (_arrivalTime) {
    routeBody.arrivalTime = _arrivalTime
  } else if (_departureTime) {
    routeBody.departureTime = _departureTime
  }

  try {
    const response = await axios.post(
      'http://localhost:3000/api/requestRoute',
      routeBody
    )

    const route = response.data.routes?.[0]
    if (!route) throw new Error('No routes returned from API')

    return route
  } catch (err) {
    if (err.response) {
      throw new Error(
        `Routes API error ${err.response.status}: ${err.response.data?.error ?? 'Unknown error'}`
      )
    } else if (err.request) {
      throw new Error('Network error: could not reach Routes API')
    }
    throw err
  }
}

export function calculateTransitLegs(route) {
  if (!route || route.transportation_mode.toUpperCase() != TravelMode.Transit) {
    return { transitLegs: [] }
  }
  const legs = []
  route.path.legs[0].steps.forEach(step => {
    const last_leg = legs.at(-1)
    let leg
    const name =
      step.travelMode === TravelMode.Walk
        ? TravelMode.Walk
        : (step.transitDetails.transitLine.nameShort ??
          step.transitDetails.transitLine.name)
    const type =
      step.travelMode === TravelMode.Walk
        ? TravelMode.Walk
        : step.transitDetails.transitLine.vehicle.type

    if (last_leg) {
      const same_leg = last_leg.name === name
      leg = {
        name: name,
        type: type,
        distance: same_leg
          ? last_leg.distance + step.distanceMeters
          : step.distanceMeters,
      }

      if (same_leg) {
        legs.pop()
      }
    } else {
      leg = {
        name: name,
        type: type,
        distance: step.distanceMeters,
      }
    }
    legs.push(leg)
  })

  return { transitLegs: legs }
}
