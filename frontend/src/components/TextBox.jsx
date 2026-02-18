import { forwardRef } from 'react'
import PropTypes from 'prop-types'

const TextBox = forwardRef(
  ({ label = '', error = null, description = '', ...props }, ref) => {
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

        <input
          ref={ref}
          className={`
          w-full px-4 py-3 rounded-xl transition-all duration-200 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
          bg-gray-50 text-text-primary placeholder:text-secondary border outline-none
          ${
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-light-grey focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
          }
          disabled:bg-light-grey disabled:cursor-not-allowed
        `}
          {...props}
        />

        {error ? (
          <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>
        ) : description ? (
          <span className="text-xs text-gray-500 ml-1">{description}</span>
        ) : null}
      </div>
    )
  }
)

TextBox.displayName = 'TextBox'

TextBox.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  description: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
}

export default TextBox
