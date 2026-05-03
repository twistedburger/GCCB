import { TravelMode } from './RouteUtils'

// @todo move these colors to a universal location
const GREEN = '#34A853'
const BLUE = '#4285F4'
const YELLOW = '#FBBC04'
const RED = '#EA4335'

/**
 * Creates a map pin to add to a route
 * @param {String} color of the pin
 * @param {String} label label on the pin
 * @returns {Object} pin object for google maps
 */
const createPin = (color, label) => {
  const pin = new google.maps.marker.PinElement({
    background: color,
    borderColor: 'white',
    glyphColor: 'white',
    glyphText: label,
    scale: 0.75,
  })
  return pin
}

/**
 * Draw a route to the map.
 *
 * @param {Object} map google map object to draw the route on
 * @param {Object} route route from database
 * @returns {Function} render cleanup function
 */
export const DrawRoute = (map, route) => {
  if (!map || !route) {
    return
  }

  const routeLine = route.path.polyline.encodedPolyline
  const decodedPath = google.maps.geometry.encoding.decodePath(routeLine)

  const bounds = new google.maps.LatLngBounds()
  decodedPath.forEach(point => bounds.extend(point))
  map.fitBounds(bounds)

  // TODO: Fix transportation mode inconsistency between backend and frontend
  const mode = route?.transportation_mode || route?.transportationMode || ''

  if (mode.toUpperCase() === TravelMode.Transit) {
    return DrawTransitRoute(map, route.path.legs[0].steps, decodedPath)
  } else {
    return DrawBasicRoute(map, decodedPath)
  }
}

/**
 * Draw a transit route to the map.
 *
 * @param {Object} map google map object to draw the route on
 * @param {Array<Object>} routeSteps list of route steps from route
 * @param {Object} decodedPath decoded route path
 * @returns {Function} render cleanup function
 */
const DrawTransitRoute = (map, routeSteps, decodedPath) => {
  const routeLines = []
  const legColors = {
    walk: GREEN,
    transit: [BLUE, YELLOW],
  }

  const mapPins = []
  let lastType = ''

  mapPins.push(
    new google.maps.marker.AdvancedMarkerElement({
      position: decodedPath[0],
      map,
      content: createPin(GREEN, 'A').element,
    })
  )

  routeSteps.forEach((step, index) => {
    let color =
      step.travelMode === TravelMode.Walk
        ? legColors.walk
        : legColors.transit[index % 2] // alternate color for transfers

    const decodedStepPath = google.maps.geometry.encoding.decodePath(
      step.polyline.encodedPolyline
    )

    const polyline = new google.maps.Polyline({
      path: decodedStepPath,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 10,
      map,
    })

    routeLines.push(polyline)
    if (lastType === '' || lastType != step.travelMode) {
      const pin = new google.maps.marker.AdvancedMarkerElement({
        position: decodedStepPath[0],
        map,
        content: createPin(color, String.fromCharCode(65 + mapPins.length))
          .element,
      })

      mapPins.push(pin)
    }
    lastType = step.travelMode
  })

  mapPins.push(
    new google.maps.marker.AdvancedMarkerElement({
      position: decodedPath[decodedPath.length - 1],
      map,
      content: createPin(RED, String.fromCharCode(65 + mapPins.length)).element,
    })
  )

  return () => {
    mapPins.forEach(pin => (pin.map = null))
    routeLines.forEach(line => line.setMap(null))
    routeLines.length = 0
  }
}

/**
 * Draw a non-transit route to the map.
 *
 * @param {Object} map google map object to draw the route on
 * @param {Object} decodedPath decoded route path
 * @returns {Function} render cleanup function
 */
const DrawBasicRoute = (map, decodedPath) => {
  const mapPins = []
  mapPins.push(
    new google.maps.marker.AdvancedMarkerElement({
      position: decodedPath[0],
      map,
      content: createPin(GREEN, 'A').element,
    })
  )
  const polyline = new google.maps.Polyline({
    path: decodedPath,
    geodesic: true,
    strokeColor: BLUE,
    strokeOpacity: 1.0,
    strokeWeight: 10,
    map,
  })

  mapPins.push(
    new google.maps.marker.AdvancedMarkerElement({
      position: decodedPath[decodedPath.length - 1],
      map,
      content: createPin(RED, String.fromCharCode(65 + mapPins.length)).element,
    })
  )

  return () => {
    polyline.setMap(null)
    mapPins.forEach(pin => (pin.map = null))
  }
}
