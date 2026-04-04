import { useEffect } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import PropTypes from 'prop-types'
import { TravelMode } from '../utils/routes'

export default function MapController({ center, route }) {
  const map = useMap()
  useEffect(() => {
    if (map && center) {
      map.panTo(center)
    }
  }, [map, center])

  useEffect(() => {
    if (!map || !route) {
      return
    }
    console.log(route)
    const routeLine = route.path.polyline.encodedPolyline
    const decodedPath = google.maps.geometry.encoding.decodePath(routeLine)

    const bounds = new google.maps.LatLngBounds()
    decodedPath.forEach(point => bounds.extend(point))
    map.fitBounds(bounds)

    if (route.transportation_mode.toUpperCase() === TravelMode.Transit) {
      // overwrite the line if transit
      const routeLines = []
      const legColors = {
        walk: '#34A853',
        transit: ['#4285F4', '#EA4335'],
      }

      route.path.legs[0].steps.forEach((step, index) => {
        let color =
          step.travelMode === TravelMode.Walk
            ? legColors.walk
            : legColors.transit[index % 2] // alternate color for transfers

        const decodedPath = google.maps.geometry.encoding.decodePath(
          step.polyline.encodedPolyline
        )

        const polyline = new google.maps.Polyline({
          path: decodedPath,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 1.0,
          strokeWeight: 10,
          map,
        })

        routeLines.push(polyline)
      })

      return () => {
        routeLines.forEach(line => line.setMap(null))
        routeLines.length = 0
      }
    } else {
      // else draw the single line
      const polyline = new google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: '#4285F4',
        strokeOpacity: 1.0,
        strokeWeight: 10,
        map,
      })

      return () => polyline.setMap(null)
    }
  }, [map, route])

  return null
}

MapController.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  route: PropTypes.object.isRequired,
}
