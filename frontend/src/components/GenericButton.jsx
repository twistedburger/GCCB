import PropTypes from 'prop-types'

/**
 * Component to display a generic button.
 *
 * @param {React.ReactNode} children - The content to display inside the button.
 * @param {Function} onClick - The function to call when the button is clicked.
 * @param {string} [customStyling=''] - Custom CSS classes to apply to the button.
 * @param {boolean} [unstyled=false] - Whether to apply default styling.
 * @param {boolean} [disabled=false] - Whether the button is disabled.
 * @param {'button'|'submit'|'reset'} [type='button'] - The type of the button.
 * @returns {JSX.Element}
 */

export default function GenericButton({
  children,
  onClick,
  customStyling = '',
  unstyled = false,
  disabled = false,
  type = 'button',
}) {
  const defaultStyling =
    'm-2 px-8 py-1 rounded-xl font-medium w-fit bg-blue-primary text-white hover:scale-110 active:scale-100 transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={
        unstyled ? customStyling : `${defaultStyling} ${customStyling}`
      } // can completely override defaultStyling or append to it
    >
      {children}
    </button>
  )
}

GenericButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  customStyling: PropTypes.string,
  unstyled: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
}
