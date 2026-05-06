import PropTypes from 'prop-types'

export default function GenericCard({
  children,
  customStyling = '',
  unstyled = false,
  onClick,
  disabled = false,
  as: Tag = 'div',
}) {
  const defaultStyling =
    'w-full rounded-xl bg-white shadow-sm border border-zinc-200'

  const interactiveStyling = onClick
    ? 'cursor-pointer transition hover:shadow-md hover:scale-[1.01] active:scale-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed'
    : ''

  const className = unstyled
    ? customStyling
    : `${defaultStyling} ${interactiveStyling} ${customStyling}`.trim()

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {children}
      </button>
    )
  }

  return <Tag className={className}>{children}</Tag>
}

GenericCard.propTypes = {
  children: PropTypes.node.isRequired,
  customStyling: PropTypes.string,
  unstyled: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  as: PropTypes.oneOf(['div', 'section', 'article']),
}
