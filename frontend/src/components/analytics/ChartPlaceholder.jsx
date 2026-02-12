import PropTypes from 'prop-types'

function ChartPlaceholder({ label, height }) {
  return (
    <div
      className="w-full rounded-2xl border border-dashed border-gray-300 
                 bg-background-off-white flex items-center justify-center
                 text-xs font-medium text-text-secondary"
      style={{ height }}
    >
      {label}
    </div>
  )
}

ChartPlaceholder.propTypes = {
  label: PropTypes.string.isRequired,
  height: PropTypes.number,
}

ChartPlaceholder.defaultProps = {
  height: 220,
}

export default ChartPlaceholder
