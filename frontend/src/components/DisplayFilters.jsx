import PropTypes from 'prop-types'
import GenericButton from './GenericButton'

export default function DisplayFilters({ filters, setFilters, isArriving }) {
  const activeFilters = []

  if (filters.time)
    activeFilters.push({
      label: `${filters.time}`,
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
      label: 'Verified only',
      key: 'verifiedEventsOnly',
      default: false,
    })
  if (!filters.mainEventsOnly && isArriving) {
    activeFilters.push({
      label: 'Display Individual Routes',
      key: 'mainEventsOnly',
      default: true,
    })
  }
  if (filters.radius !== 500)
    activeFilters.push({
      label: `${filters.radius}m`,
      key: 'radius',
      default: 500,
    })

  if (activeFilters.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 shrink-0">
      {activeFilters.map(f => (
        <GenericButton
          key={f.key}
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
              updatedFilters[f.key] = f.default
              return updatedFilters
            })
          }}
        >
          {f.label}
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
