import PropTypes from 'prop-types'

/**
 * A generic card container component.
 * Use `unstyled` to completely override default styling, or use `customStyling`
 * to include any additional classes.
 * Pass `onClick` to make the card interactive.
 *
 * @param {React.ReactNode} children    Content to display inside the card.
 * @param {string}  [customStyling='']  Additional Tailwind classes to append.
 * @param {boolean} [unstyled=false]    If true, customStyling is applied.
 * @param {Function} [onClick]          Optional click handler; renders as a button for accessibility.
 * @param {boolean} [disabled=false]    Disables interaction when onClick is provided.
 * @param {string}  [as='div']          HTML element to render e.g. div, section, article, etc.
 * @returns {JSX.Element}
 */
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
