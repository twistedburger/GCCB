import PropTypes from 'prop-types'

function ChartPlaceholder({ label, height }) {
  return (
    <div
      style={{
        height,
        border: '1px dashed #ddd',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        opacity: 0.85,
      }}
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
  height: 200,
}

export default ChartPlaceholder
