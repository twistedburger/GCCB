import PropTypes from 'prop-types'
import {
  EmojiNature,
  DirectionsBike,
  DirectionsBus,
  DirectionsWalk,
  DirectionsCar,
  Star,
  Groups,
  CalendarMonth,
  EmojiEvents,
  Public,
  Place,
  Map,
  AddCircleOutline,
  Repeat,
  DirectionsRailway,
} from '@mui/icons-material'
import GenericCard from './GenericCard'

const BADGE_ICONS = {
  leaf: EmojiNature,
  bicycle: DirectionsBike,
  train: DirectionsRailway,
  bus: DirectionsBus,
  walking: DirectionsWalk,
  car: DirectionsCar,
  star: Star,
  users: Groups,
  calendar: CalendarMonth,
  award: EmojiEvents,
  globe: Public,
  footprint: Place,
  map: Map,
  'plus-circle': AddCircleOutline,
  network: Groups,
  crown: EmojiEvents,
  repeat: Repeat,
}

const TIER_CONFIG = {
  1: {
    label: 'Bronze',
    pillStyle: 'bg-amber-100 text-amber-800',
    iconColor: 'text-amber-700',
  },
  2: {
    label: 'Silver',
    pillStyle: 'bg-zinc-100 text-zinc-600',
    iconColor: 'text-zinc-500',
  },
  3: {
    label: 'Gold',
    pillStyle: 'bg-yellow-100 text-yellow-700',
    iconColor: 'text-yellow-600',
  },
}

export default function BadgeCard({ badge, showLocked = false }) {
  const { title, category, tier, iconKey, earned } = badge

  const isInProgress = !earned && (badge.currentValue ?? 0) > 0
  const isLocked = !earned && !isInProgress

  if (isLocked && !showLocked) return null

  const tierConfig = TIER_CONFIG[tier] ?? TIER_CONFIG[1]
  const IconComp = BADGE_ICONS[iconKey] ?? Star

  return (
    <GenericCard customStyling="p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className={tierConfig.iconColor}>
          <IconComp fontSize="large" />
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tierConfig.pillStyle}`}
        >
          {tierConfig.label}
        </span>
      </div>
      <div>
        <p className="font-semibold text-sm text-text-primary leading-tight">
          {title}
        </p>
        <p className="text-[11px] text-text-secondary capitalize mt-0.5">
          {category?.replace('_', ' ')}
        </p>
      </div>
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
