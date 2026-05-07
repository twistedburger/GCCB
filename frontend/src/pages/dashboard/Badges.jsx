import { useNavigate } from 'react-router-dom'
import GenericButton from '../../components/GenericButton'
import { analyticsStrings } from '../../locales/en/AnalyticsStrings'
import BadgeCard from '../../components/BadgeCard'

const PLACEHOLDER_BADGE = {
  id: 0,
  key: 'placeholder',
  title: 'Badge Title',
  category: 'category',
  tier: 1,
  metric: 'trip_count',
  threshold: 10,
  iconKey: 'star',
  earned: false,
  dateEarned: null,
  currentValue: 0,
  progress: 0,
}

export default function Badges() {
  const navigate = useNavigate()

  return (
    <div className="relative mx-auto w-full max-w-5xl p-4">
      <GenericButton
        type="button"
        onClick={() => navigate('/dashboard')}
        unstyled
        customStyling="mb-4 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
      >
        {analyticsStrings.common.back}
      </GenericButton>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Badges (Placeholder text)</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <BadgeCard badge={PLACEHOLDER_BADGE} showLocked />
      </div>
    </div>
  )
}
