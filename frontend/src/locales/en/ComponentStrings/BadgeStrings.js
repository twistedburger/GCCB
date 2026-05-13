import { CATEGORIES } from '../../../utils/BadgeUtils'

export const badgesStrings = {
  title: 'Badges',
  loading: 'Loading badges.',
  error: 'Failed to load badges.',
  earnedCount: (earned, total) => `${earned} of ${total} earned`,

  views: {
    all: 'All',
    earned: 'Earned',
    inProgress: 'In Progress',
  },

  categories: {
    [CATEGORIES.ECO_IMPACT]: 'Eco Impact',
    [CATEGORIES.TRIPS]: 'Trip Milestones',
    [CATEGORIES.MODES]: 'Mode Explorer',
    [CATEGORIES.SOCIAL]: 'Social',
  },

  earned: date => `Earned ${date}`,
  needed: (threshold, unit) => `${threshold} ${unit} needed`,
  emptyEarned: 'Complete trips to start earning badges!',
  emptyProgress: 'No badges in progress yet.',
}
