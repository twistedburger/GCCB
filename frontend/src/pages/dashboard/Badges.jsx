import { useNavigate } from 'react-router-dom'
import GenericButton from '../../components/GenericButton'
import { analyticsStrings } from '../../locales/en/AnalyticsStrings'

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
        <h1 className="text-2xl font-semibold">Badges (placeholder text)</h1>
      </div>
    </div>
  )
}
