import PropTypes from 'prop-types'

/**
 * A data display card for containing charts or visualizations.
 *
 * @param {Object} props
 * @param {string} props.title - The title of the chart.
 * @param {string} [props.subtitle] - Optional subtitle for additional context.
 * @param {React.ReactNode} props.children - The chart or visualization content.
 * @returns {JSX.Element}
 */

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="w-full bg-gray-100 rounded-3xl p-5 shadow-sm border border-gray-400">
      <div className="mb-4">
        <h4 className="text-base font-bold text-text-primary">{title}</h4>

        {subtitle && (
          <p className="mt-1 text-xs font-medium text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </section>
  )
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default ChartCard
