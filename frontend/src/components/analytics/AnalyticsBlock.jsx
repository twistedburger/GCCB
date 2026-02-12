import PropTypes from 'prop-types'

function AnalyticsBlock({ title, description, children }) {
  return (
    <section className="mt-6">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-text-primary">{title}</h3>

        {description && (
          <p className="mt-1 text-sm font-medium text-text-secondary">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  )
}

AnalyticsBlock.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default AnalyticsBlock
