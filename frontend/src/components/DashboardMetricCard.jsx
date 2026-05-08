import PropTypes from 'prop-types'
import GenericCard from './GenericCard'
import { analyticsStrings } from '../locales/en/AnalyticsStrings'

/**
 * Component to display a metric card in the dashboard.
 *
 * @param {string} title - The title of the metric card.
 * @param {React.ReactNode} value - The value to display in the metric card.
 * @param {string} [subtitle] - An optional subtitle for the metric card.
 * @param {Function} [onClick] - The function to call when the metric card is clicked.
 * @returns {JSX.Element}
 */

export default function DashboardMetricCard({
  title,
  value,
  subtitle,
  onClick,
}) {
  return (
    <GenericCard
      onClick={onClick}
      customStyling="p-4 text-left rounded-2xl hover:shadow-md active:shadow-sm active:scale-[0.99]"
    >
      <div className="text-lg font-semibold text-zinc-900">{value}</div>
      <div className="mt-1 text-xs text-zinc-600">{title}</div>

      {subtitle ? (
        <div className="mt-2 text-xs text-zinc-500">{subtitle}</div>
      ) : null}

      {onClick ? (
        <span className="mt-3 block text-xs font-medium text-blue-primary">
          {analyticsStrings.dashboard.metrics.viewDetails}
        </span>
      ) : null}
    </GenericCard>
  )
}

DashboardMetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  subtitle: PropTypes.string,
  onClick: PropTypes.func,
}
