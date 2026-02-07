import PropTypes from 'prop-types'

export default function SubmitButton({ disabled }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="m-2 px-16 py-2 rounded-[10px] font-medium bg-blue-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Submit
    </button>
  )
}

SubmitButton.propTypes = { disabled: PropTypes.bool }
