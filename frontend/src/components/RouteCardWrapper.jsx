import PropTypes from 'prop-types'
import { useState, useMemo, useEffect } from 'react'
import { ExpandMoreRounded } from '@mui/icons-material'
import { decode } from 'google-polyline'
import GenericButton from './GenericButton'
import MainMap from './MainMap'
import { routeCardWrapperStrings } from '../locales/en/ComponentStrings/RouteCardWrapperStrings'

/**
 * A wrapper component for containing and managing the expanded state of a route map.
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child nodes to be displayed within the wrapper.
 * @param {Object} props.route - The route data for which to display a map.
 * @param {boolean} props.mapsReady - Flag indicating if the map is ready for rendering.
 * @returns {JSX.Element}
 */

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
            <span>
              {isExpanded
                ? routeCardWrapperStrings.hideMap
                : routeCardWrapperStrings.showMap}
            </span>
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
            <div className="h-48 relative border-16 border-white border-t-1">
              {!mapsReady ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm bg-gray-50">
                  {routeCardWrapperStrings.loading}
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
