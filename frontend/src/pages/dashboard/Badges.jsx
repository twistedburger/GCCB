import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GenericButton from '../../components/GenericButton'
import BadgeCard from '../../components/BadgeCard'
import { analyticsStrings } from '../../locales/en/AnalyticsStrings'
import { VIEWS, CATEGORY_ORDER, filterForView } from '../../utils/BadgeUtils'
import { badgesStrings } from '../../locales/en/ComponentStrings/BadgeStrings'
import HighlightCard from '../../components/HighlightCard'
import { useUser } from '../../../context/UserContext'

/**
 * Badge display page.
 *
 * @returns {JSX.Element}
 */
export default function Badges() {
  const navigate = useNavigate()
  const baseURL = import.meta.env.VITE_API_BASE_URL
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState(VIEWS.ALL)
  const { id } = useParams()
  const cardRefs = useRef({})
  const { user, loadingUser } = useUser()

  useEffect(() => {
    async function fetchBadges() {
      if (loadingUser || !user?.id) return
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${baseURL}/api/badges/${user.id}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error(badgesStrings.error)
        const data = await res.json()
        setBadges(data.badges ?? [])
      } catch (err) {
        console.error('Failed to load badges:', err)
        setError(badgesStrings.error)
      } finally {
        setLoading(false)
      }
    }
    fetchBadges()
  }, [baseURL, user?.id, loadingUser])

  const earnedCount = badges.filter(badgeFilter => badgeFilter.earned).length
  const viewBadges = filterForView(badges, view)

  useEffect(() => {
    if (!id) return

    setView(VIEWS.EARNED)

    if (cardRefs.current[parseInt(id)]) {
      cardRefs.current[parseInt(id)].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [id, viewBadges])

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
        <h1 className="text-2xl font-semibold">{badgesStrings.title}</h1>
        {!loading && !error && (
          <p className="mt-1 text-sm text-zinc-500">
            {badgesStrings.earnedCount(earnedCount, badges.length)}
          </p>
        )}
      </div>

      <div className="mb-6 flex w-fit rounded-2xl border border-zinc-200 bg-white overflow-hidden text-sm">
        {Object.entries(VIEWS).map(([, viewEntry]) => (
          <GenericButton
            key={viewEntry}
            type="button"
            onClick={() => setView(viewEntry)}
            unstyled
            customStyling={`px-4 py-2 font-medium transition-colors ${
              view === viewEntry
                ? 'bg-blue-primary text-white'
                : 'text-text-secondary hover:bg-zinc-50'
            }`}
          >
            {badgesStrings.views[viewEntry]}
          </GenericButton>
        ))}
      </div>

      {loading && (
        <p className="text-sm text-text-secondary">{badgesStrings.loading}</p>
      )}

      {!loading && error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {view === VIEWS.ALL && (
            <div className="flex flex-col gap-8">
              {CATEGORY_ORDER.map(cat => {
                const catBadges = viewBadges.filter(b => b.category === cat)
                if (catBadges.length === 0) return null
                return (
                  <section key={cat}>
                    <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                      {badgesStrings.categories[cat] ?? cat}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {catBadges.map(badge => (
                        <BadgeCard key={badge.id} badge={badge} showLocked />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}

          {view === VIEWS.EARNED &&
            (viewBadges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-text-secondary text-sm">
                  {badgesStrings.emptyEarned}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {viewBadges.map(badge => (
                  <HighlightCard
                    key={badge.id}
                    ref={element => (cardRefs.current[badge.id] = element)}
                    shouldFlash={badge.id === parseInt(id)}
                  >
                    <BadgeCard badge={badge} />
                  </HighlightCard>
                ))}
              </div>
            ))}

          {view === VIEWS.IN_PROGRESS &&
            (viewBadges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-text-secondary text-sm">
                  {badgesStrings.emptyProgress}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {viewBadges.map(badge => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            ))}
        </>
      )}
    </div>
  )
}
