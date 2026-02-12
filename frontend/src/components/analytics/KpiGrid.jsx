import PropTypes from 'prop-types'

function KpiCard({ label, value, subvalue }) {
  return (
    <div className="bg-gray-100 rounded-3xl p-5 shadow-sm border border-gray-400">
      <div className="text-xs font-medium text-text-secondary">{label}</div>

      <div className="mt-1 text-xl font-bold text-text-primary">{value}</div>

      {subvalue && (
        <div className="mt-3 text-xs font-medium text-text-secondary">
          {subvalue}
        </div>
      )}
    </div>
  )
}

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  subvalue: PropTypes.string,
}

function KpiGrid({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map(k => (
        <KpiCard
          key={k.label}
          label={k.label}
          value={k.value}
          subvalue={k.subvalue}
        />
      ))}
    </div>
  )
}

KpiGrid.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.node.isRequired,
      subvalue: PropTypes.string,
    })
  ).isRequired,
}

export default KpiGrid
