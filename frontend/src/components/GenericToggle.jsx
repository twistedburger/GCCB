import PropTypes from 'prop-types'

export default function GenericToggle({ value, onChange, labels }) {
  const toggle = () => onChange(!value)

  return (
    <div
      className="w-56 rounded-2xl grid grid-cols-2 bg-white relative cursor-pointer text-sm shrink-0"
      onClick={toggle}
    >
      <div
        className={`absolute inset-0 w-1/2 bg-blue-primary rounded-2xl transition-transform duration-300 ease-in-out ${
          value ? 'translate-x-0' : 'translate-x-full'
        }`}
      />
      <button
        type="button"
        className={
          value
            ? 'bg-blue-primary rounded-2xl text-white py-1 relative transition-colors duration-300'
            : 'text-text-secondary opacity-50'
        }
      >
        {labels[0]}
      </button>
      <button
        type="button"
        className={
          !value
            ? 'bg-blue-primary rounded-2xl text-white py-1 relative transition-colors duration-300'
            : 'text-text-secondary opacity-50'
        }
      >
        {labels[1]}
      </button>
    </div>
  )
}

GenericToggle.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func,
  labels: PropTypes.arrayOf(PropTypes.string),
}
