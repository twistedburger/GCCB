import PropTypes from 'prop-types'
import GenericButton from './GenericButton'

function DashboardMetricCard({ title, value, subtitle, onClick }) {
  return (
    <GenericButton
      type="button"
      onClick={onClick}
      unstyled
      customStyling={`
        w-full rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm
        transition hover:scale-[1.02] hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-zinc-300
      `}
    >
      <div className="text-lg font-semibold text-zinc-900">{value}</div>
      <div className="mt-1 text-xs text-zinc-600">{title}</div>

      {subtitle ? (
        <div className="mt-2 text-xs text-zinc-500">{subtitle}</div>
      ) : null}
    </GenericButton>
  )
}

DashboardMetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  subtitle: PropTypes.string,
  onClick: PropTypes.func,
}

export default DashboardMetricCard
