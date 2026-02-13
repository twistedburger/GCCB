import PropTypes from 'prop-types'

export default function ArriveDepartToggle({ isArriving, setIsArriving }) {
  const toggle = () => setIsArriving(!isArriving)

  return (
    <div
      className="w-56 rounded-2xl grid grid-cols-2 bg-white relative cursor-pointer text-sm shrink-0"
      onClick={toggle}
    >
      <div
        className={`absolute inset-0 w-1/2 bg-blue-primary rounded-2xl transition-transform duration-300 ease-in-out ${
          isArriving ? 'translate-x-0' : 'translate-x-full'
        }`}
      />
      <button
        type="button"
        className={
          isArriving
            ? 'bg-blue-primary rounded-2xl text-white py-1 relative transition-colors duration-300'
            : 'text-text-secondary opacity-50'
        }
      >
        Arriving Near
      </button>
      <button
        type="button"
        className={
          !isArriving
            ? 'bg-blue-primary rounded-2xl text-white py-1 relative transition-colors duration-300'
            : 'text-text-secondary opacity-50'
        }
      >
        Departing Near
      </button>
    </div>
  )
}

ArriveDepartToggle.propTypes = {
  isArriving: PropTypes.bool,
  setIsArriving: PropTypes.func,
}
