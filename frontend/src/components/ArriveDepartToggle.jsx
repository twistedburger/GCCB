import PropTypes from 'prop-types'

export default function ArriveDepartToggle({ isArriving, setIsArriving }) {
  const toggle = () => setIsArriving(!isArriving)

  return (
    <div
      className="m-2 w-70 rounded-2xl grid grid-cols-2 bg-white relative cursor-pointer"
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
            ? 'bg-blue-primary rounded-2xl text-white font-medium py-1 relative transition-colors duration-300'
            : 'text-text-secondary opacity-50 font-medium'
        }
      >
        Arriving Near
      </button>
      <button
        type="button"
        className={
          !isArriving
            ? 'bg-blue-primary rounded-2xl text-white font-medium py-1 relative transition-colors duration-300'
            : 'text-text-secondary opacity-50 font-medium'
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
