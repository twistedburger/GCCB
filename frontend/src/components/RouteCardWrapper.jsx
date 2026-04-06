import PropTypes from 'prop-types'
import { useState, useMemo, useEffect } from 'react'
import { ExpandMoreRounded } from '@mui/icons-material'
import { decode } from 'google-polyline'
import GenericButton from './GenericButton'
import MainMap from './MainMap'

export default function RouteCardWrapper({ children, route, mapsReady }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [map, setMap] = useState(null)

  const pathCoordinates = useMemo(() => {
    return route?.path?.polyline?.encodedPolyline
      ? decode(route.path.polyline.encodedPolyline).map(([lat, lng]) => ({
          lat,
          lng,
        }))
      : []
  }, [route])

  useEffect(() => {
    if (map && pathCoordinates.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      pathCoordinates.forEach(point => bounds.extend(point))
      map.fitBounds(bounds)
    }
  }, [map, pathCoordinates, isExpanded])

  const hasRoute = pathCoordinates.length > 0

  return (
    <div className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white overflow-hidden">
      {children}

      {hasRoute && (
        <div className="border-t border-gray-100">
          <GenericButton
            unstyled
            customStyling="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setIsExpanded(prev => !prev)}
          >
            <span>{isExpanded ? 'Hide map' : 'Show map'}</span>
            <ExpandMoreRounded
              fontSize="small"
              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </GenericButton>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isExpanded ? 'max-h-48' : 'max-h-0'
            }`}
          >
            <div className="h-48 relative border-16 border-white border-t-">
              {!mapsReady ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm bg-gray-50">
                  Loading map...
                </div>
              ) : (
                <MainMap
                  defaultCenter={
                    pathCoordinates[0] || { lat: 49.2827, lng: -123.1207 }
                  }
                  route={route}
                  onLoad={setMap}
                  onUnmount={() => setMap(null)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

RouteCardWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  route: PropTypes.object.isRequired,
  mapsReady: PropTypes.bool,
}
