import PropTypes from 'prop-types'
import GenericCard from './GenericCard'

export default function BadgeCard({ badge, showLocked = false }) {
  const { title, category, earned } = badge

  const isInProgress = !earned && (badge.currentValue ?? 0) > 0
  const isLocked = !earned && !isInProgress

  if (isLocked && !showLocked) return null

  return (
    <GenericCard customStyling="p-4 flex flex-col gap-2">
      <p className="font-semibold text-sm text-text-primary">{title}</p>
      <p className="text-[11px] text-text-secondary capitalize">{category}</p>
    </GenericCard>
  )
}

BadgeCard.propTypes = {
  badge: PropTypes.shape({
    id: PropTypes.number.isRequired,
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    tier: PropTypes.number.isRequired,
    metric: PropTypes.string.isRequired,
    threshold: PropTypes.number.isRequired,
    iconKey: PropTypes.string.isRequired,
    earned: PropTypes.bool.isRequired,
    dateEarned: PropTypes.string,
    currentValue: PropTypes.number,
    progress: PropTypes.number,
  }).isRequired,
  showLocked: PropTypes.bool,
}
