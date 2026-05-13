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
import { progressWidth, metricUnit } from '../utils/BadgeUtils'
import { badgesStrings } from '../locales/en/ComponentStrings/BadgeStrings'

/**
 * Maps badge icon_key values to Material UI icons.
 * Will default to a Star if the icon_key is not found.
 *
 * @type {Object.<string, React.ComponentType>}
 */
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
  plusCircle: AddCircleOutline,
  network: Groups,
  crown: EmojiEvents,
  repeat: Repeat,
}

/**
 * Visual configs for each badge tier.
 *
 * @type {Object.<number, { label: string, pillStyle: string, iconColor: string, barColor: string }>}
 */
const TIER_CONFIG = {
  1: {
    label: 'Bronze',
    pillStyle: 'bg-amber-100 text-amber-800',
    iconColor: 'text-amber-700',
    barColor: 'bg-orange-primary',
  },
  2: {
    label: 'Silver',
    pillStyle: 'bg-zinc-100 text-zinc-600',
    iconColor: 'text-zinc-500',
    barColor: 'bg-blue-primary',
  },
  3: {
    label: 'Gold',
    pillStyle: 'bg-yellow-100 text-yellow-700',
    iconColor: 'text-yellow-600',
    barColor: 'bg-purple-primary',
  },
}

/**
 * Displays a single badge tile in one of three visual states:
 * - Earned: fully coloured icon with date label
 * - In Progress: partially muted icon with progress bar, percentage and threshold label
 * - Locked: greyscale, dimmed, thresholds shown
 *
 * Locked badges are hidden unless showLocked is true.
 * Used in the Badges page grid and can be extended for other badge displays.
 *
 * @param {Object}  props
 * @param {Object}  props.badge                Badge object from GET /api/badges.
 * @param {number}  props.badge.id             Badge DB id.
 * @param {string}  props.badge.key            Unique badge key.
 * @param {string}  props.badge.title          Display title.
 * @param {string}  props.badge.category       DB category value e.g. 'eco_impact'.
 * @param {number}  props.badge.tier           Tier level: 1 (Bronze), 2 (Silver), 3 (Gold).
 * @param {string}  props.badge.metric         Metric key e.g. 'trip_count'.
 * @param {number}  props.badge.threshold      Value required to earn the badge.
 * @param {string}  props.badge.iconKey        Key into BADGE_ICONS map.
 * @param {boolean} props.badge.earned         Whether the badge has been earned.
 * @param {string}  [props.badge.dateEarned]   ISO date string of when the badge was earned.
 * @param {number}  [props.badge.currentValue] User's current metric value.
 * @param {number}  [props.badge.progress]     Fraction between 0 and 1.
 * @param {boolean} [props.showLocked]         Whether to render locked badges. Default false.
 * @returns {JSX.Element|null}
 */
export default function BadgeCard({ badge, showLocked = false }) {
  const {
    title,
    category,
    tier,
    iconKey,
    metric,
    earned,
    dateEarned,
    currentValue,
    progress,
    threshold,
  } = badge

  const isInProgress = !earned && (currentValue ?? 0) > 0
  const isLocked = !earned && !isInProgress

  if (isLocked && !showLocked) return null

  const tierConfig = TIER_CONFIG[tier] ?? TIER_CONFIG[1]
  const IconComp = BADGE_ICONS[iconKey] ?? Star
  const unit = metricUnit(metric)

  const iconStyle = earned
    ? tierConfig.iconColor
    : isInProgress
      ? 'text-text-secondary'
      : 'text-medium-grey'

  const cardExtra = isLocked ? 'opacity-60' : ''

  const earnedDateLabel = dateEarned
    ? new Date(dateEarned).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  return (
    <GenericCard customStyling={`p-4 flex flex-col gap-2 ${cardExtra}`}>
      <div className="flex items-start justify-between">
        <div className={iconStyle}>
          <IconComp fontSize="large" />
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tierConfig.pillStyle}`}
        >
          {tierConfig.label}
        </span>
      </div>
      <div>
        <p
          className={`font-semibold text-sm leading-tight ${isLocked ? 'text-text-secondary' : 'text-text-primary'}`}
        >
          {title}
        </p>
        <p className="text-[11px] text-text-secondary capitalize mt-0.5">
          {category?.replace('_', ' ')}
        </p>
      </div>

      {earned && (
        <p className="text-[11px] text-green-primary font-medium mt-auto">
          {badgesStrings.earned(earnedDateLabel)}
        </p>
      )}

      {isInProgress && (
        <div className="mt-auto flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-light-grey overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${tierConfig.barColor}`}
                style={{ width: progressWidth(progress) }}
              />
            </div>
            <span className="text-[10px] text-text-secondary tabular-nums shrink-0">
              {Math.round((progress ?? 0) * 100)}%
            </span>
          </div>
          <p className="text-[11px] text-text-secondary">
            {Number(currentValue ?? 0).toFixed(1)} / {threshold} {unit}
          </p>
        </div>
      )}

      {isLocked && (
        <p className="text-[11px] text-medium-grey mt-auto">
          {badgesStrings.needed(threshold, unit)}
        </p>
      )}
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
