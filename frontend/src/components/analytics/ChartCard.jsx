import PropTypes from 'prop-types'

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
