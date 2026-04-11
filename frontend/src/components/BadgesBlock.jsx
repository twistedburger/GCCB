import PropTypes from 'prop-types'
import { badgesBlockStrings } from '../locales/en/ComponentStrings/BadgesBlockStrings'

/**
 * Component to display a list of earned user badges.
 *
 * @param {Object} user - The user object containing profile information.
 * @param {string[]} [user.badges] - An optional array of badge names or IDs.
 * @returns {JSX.Element}
 */

const BadgesBlock = ({ user }) => {
  // TODO: fetch badges from badges table depending on userid and display accordingly. Currently displays text only.
  const badges = user?.badges || []

  return (
    <div className="flex flex-col w-full gap-1.5 mb-4">
      <label className="text-sm font-semibold text-text-primary ml-1">
        {badgesBlockStrings.badges}
      </label>
      <div
        className="w-full rounded-xl shadow-xs 
                 bg-white flex items-center justify-center
                 text-xs font-medium text-text-secondary p-4"
      >
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {badges.map((badge, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-blue-primary text-white text-xs"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : (
          <span>{badgesBlockStrings.noBadges}</span>
        )}
      </div>
    </div>
  )
}

BadgesBlock.propTypes = {
  user: PropTypes.object,
}

export default BadgesBlock
