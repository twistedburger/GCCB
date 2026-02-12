import { PropTypes } from 'prop-types'

import { t } from '../locales'
import commute_img from '../assets/commute_img.png'
import events_img from '../assets/events_img.png'
import analysis_img from '../assets/analysis_img.png'

import map_img from '../assets/map_img.png'
import toggle_img from '../assets/toggle_img.png'
import choose_pin_img from '../assets/choose_pin_img.png'
import join_img from '../assets/join_img.png'
import organize_img from '../assets/organize_img.png'
import dashboard_img from '../assets/dashboard_img.png'
import badge_img from '../assets/badge_img.png'

const NavButton = ({ target, label }) => (
  <a
    href={`#${target}`}
    className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-text-secondary bg-white rounded-full 
        active:scale-95 transition-all hover:text-blue-primary text-center min-w-[90px]"
  >
    {label}
  </a>
)

NavButton.propTypes = {
  target: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
}

// Individual cards for each topic in user guide
const GuideCard = ({ id, data }) => {
  const hasPoints = data.points && data.points.length > 0

  // Image for each points in card
  const getPointImage = index => {
    if (id === 'commuting') return index === 0 ? map_img : toggle_img
    if (id === 'events') {
      if (index === 0) return choose_pin_img
      if (index === 1) return join_img
      return organize_img
    }
    return index === 0 ? dashboard_img : badge_img
  }

  return (
    <section
      id={id}
      className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center lg:max-w-xs xl:max-w-sm"
    >
      {/* Topic image for each card */}
      <img
        className="w-full h-48 object-contain rounded-lg mb-6"
        src={
          id === 'commuting'
            ? commute_img
            : id === 'events'
              ? events_img
              : analysis_img
        }
        alt={data.title}
      />

      {/* Title and subtitle */}
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{data.title}</h2>
      <p className="font-medium text-blue-primary italic text-sm">
        {data.subtitle}
      </p>

      {/* Points for each card */}
      <div className="mt-6 w-full space-y-12">
        {hasPoints &&
          data.points.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Title for each point */}
              <h4 className="font-bold text-gray-800 text-lg mb-3 tracking-wide">
                {item.term}
              </h4>
              {/* Image for each point */}
              <img
                className="w-full max-w-[260px] rounded-2xl mb-4 shadow-md border border-background-off-white transition-transform"
                src={getPointImage(index)}
                alt={item.term}
              />
              {/* Description for each point */}
              <p className="text-sm leading-relaxed px-2 text-text-secondary">
                {item.desc}
              </p>
            </div>
          ))}
      </div>
    </section>
  )
}

function UserGuide() {
  const { userGuide } = t

  return (
    <div className="flex flex-col h-screen w-full bg-background-off-white overflow-hidden">
      <header className="text-center pt-8 pb-4 px-6 w-full shrink-0 bg-background-off-white">
        <h1 className="text-3xl font-extrabold text-text-primary">
          {userGuide.pageTitle}
        </h1>
        <p className="mt-2 text-md font-medium text-blue-primary">
          {userGuide.pageDescription}
        </p>
      </header>
      {/* Show sticky navigation buttons on md-sm view for smooth scrolling */}
      <nav className="backdrop-blur-md flex lg:hidden justify-center gap-2 mb-4 w-full shrink-0 px-6 bg-background-off-white">
        <div className="flex gap-2 bg-white rounded-full shadow-sm">
          <NavButton target="commuting" label={userGuide.miniNav.commute} />
          <NavButton target="events" label={userGuide.miniNav.events} />
          <NavButton target="analysis" label={userGuide.miniNav.impact} />
        </div>
      </nav>

      {/* Vertical stacking on md-sm view, Horizontal on lg and above */}
      <main className="flex-1 overflow-y-auto scroll-smooth px-6 pb-24">
        <div className="flex flex-col lg:flex-row lg:items-start items-center justify-center gap-8 w-full max-w-7xl mx-auto pt-4">
          <GuideCard id="commuting" data={userGuide.commuting} />
          <GuideCard id="events" data={userGuide.events} />
          <GuideCard id="analysis" data={userGuide.analysis} />
        </div>
      </main>
    </div>
  )
}

GuideCard.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    points: PropTypes.arrayOf(
      PropTypes.shape({
        term: PropTypes.string,
        desc: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
}

export default UserGuide
