import PropTypes from 'prop-types'

/**
 * A button component for submitting forms.
 *
 * @param {Object} props
 * @param {boolean} props.disabled - Flag indicating if the button should be disabled.
 * @param {Function} props.onClick - The function to call when the button is clicked.
 * @returns {JSX.Element}
 */

export default function SubmitButton({ disabled, onClick }) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      className="m-2 px-16 py-2 rounded-[10px] font-medium bg-blue-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Submit
    </button>
  )
}

SubmitButton.propTypes = { disabled: PropTypes.bool, onClick: PropTypes.func }
