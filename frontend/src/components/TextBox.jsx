import { forwardRef } from 'react'
import PropTypes from 'prop-types'

/**
 * A text input component with optional label, error handling, and description.
 * @param {Object} props
 * @param {string} props.label - The label for the text input.
 * @param {string} props.error - The error message for the text input validation.
 * @param {string} props.description - The description for the text input.
 * @param {boolean} props.multiline - Flag indicating if the input is multiline.
 * @param {React.Ref} ref - The ref for the text input.
 * @returns {JSX.Element}
 */

const TextBox = forwardRef(
  (
    { label = '', error = null, description = '', multiline = false, ...props },
    ref
  ) => {
    const sharedClassName = `
      w-full px-4 py-3 rounded-xl transition-all duration-200 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
      bg-gray-50 text-text-primary placeholder:text-secondary outline-none
      ${
        error
          ? 'border border-red-500'
          : 'border-light-grey focus:border-blue-500 focus:border-2 focus:ring-4 focus:ring-blue-100'
      }
      disabled:bg-light-grey disabled:cursor-not-allowed
    `

    return (
      <div className="flex flex-col w-full gap-1.5 mb-4">
        {label && (
          <label
            className="text-sm font-semibold text-text-primary ml-1"
            htmlFor={props.id || props.name}
          >
            {label}
          </label>
        )}

        {multiline ? (
          <textarea ref={ref} rows={4} className={sharedClassName} {...props} />
        ) : (
          <input ref={ref} className={sharedClassName} {...props} />
        )}

        {error ? (
          <span className="flex justify-end text-xs text-red-500 ml-1 font-small">
            {error}
          </span>
        ) : description ? (
          <span className="text-xs text-gray-500 ml-1">{description}</span>
        ) : null}
      </div>
    )
  }
)

export default TextBox

TextBox.displayName = 'TextBox'

TextBox.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  description: PropTypes.string,
  multiline: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
}
