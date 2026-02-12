import PropTypes from 'prop-types'

export default function GenericButton({
  children,
  onClick,
  customStyling = '',
  unstyled = false,
  disabled = false,
  type = 'button',
}) {
  const defaultStyling =
    'm-2 px-8 py-1 rounded-xl font-medium w-fit bg-blue-primary text-white'

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
