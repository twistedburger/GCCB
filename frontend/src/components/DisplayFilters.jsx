import PropTypes from 'prop-types'
import GenericButton from './GenericButton'
import { displayFilterStrings } from '../locales/en/ComponentStrings/DisplayFiltersStrings'

const DEFAULT_RADIUS = 2000

/**
 * Component to display active filters and allow users to remove them.
 *
 * @param {Object} filters - The current filter settings.
 * @param {Function} setFilters - Function to update the filter settings.
 * @param {boolean} isArriving - Whether the user is viewing arriving events (affects mainEventsOnly filter).
 * @returns {JSX.Element|null}
 */

export default function DisplayFilters({ filters, setFilters, isArriving }) {
  const activeFilters = []

  if (filters.time)
    activeFilters.push({
      label: new Date(filters.time).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      key: 'time',
      default: null,
    })
  if (filters.transportationModes.length > 0)
    activeFilters.push({
      label: filters.transportationModes.join(', '),
      key: 'transportationModes',
      default: [],
    })
  if (filters.verifiedEventsOnly)
    activeFilters.push({
      label: displayFilterStrings.verifiedOnly,
      key: 'verifiedEventsOnly',
      default: false,
    })
  if (!filters.mainEventsOnly && isArriving) {
    activeFilters.push({
      label: displayFilterStrings.displayIndividualRoutes,
      key: 'mainEventsOnly',
      default: true,
    })
  }
  if (filters.radius !== DEFAULT_RADIUS)
    activeFilters.push({
      label: `${filters.radius}m`,
      key: 'radius',
      default: DEFAULT_RADIUS,
    })

  if (activeFilters.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 shrink-0">
      {activeFilters.map(filter => (
        <GenericButton
          key={filter.key}
          unstyled
          customStyling="flex items-center gap-1 whitespace-nowrap px-3 py-1 rounded-full border border-light-grey bg-white text-[14px] text-text-secondary shrink-0 capitalize"
          onClick={() => {
            setFilters(prev => {
              const updatedFilters = {
                time: prev.time,
                transportationModes: prev.transportationModes,
                radius: prev.radius,
                verifiedEventsOnly: prev.verifiedEventsOnly,
                mainEventsOnly: prev.mainEventsOnly,
              }
              updatedFilters[filter.key] = filter.default
              return updatedFilters
            })
          }}
        >
          {filter.label}
          <span className="text-medium-grey text-xs">✕</span>
        </GenericButton>
      ))}
    </div>
  )
}

DisplayFilters.propTypes = {
  filters: PropTypes.shape({
    time: PropTypes.object,
    transportationModes: PropTypes.arrayOf(PropTypes.string).isRequired,
    verifiedEventsOnly: PropTypes.bool,
    mainEventsOnly: PropTypes.bool,
    radius: PropTypes.number,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  isArriving: PropTypes.bool.isRequired,
}
