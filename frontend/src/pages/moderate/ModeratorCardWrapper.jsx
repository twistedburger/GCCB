import PropTypes from 'prop-types'
import ModerationActions from './ModerationActions'

export default function ModeratorCardWrapper({ children, reportInformation }) {
  return (
    <div className="flex flex-col w-full rounded-xl shadow-md shadow-medium-grey bg-white overflow-hidden">
      {children}
      <ModerationActions reportInformation={reportInformation} />
    </div>
  )
}

ModeratorCardWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  reportInformation: PropTypes.shape({
    id: PropTypes.number,
    reason: PropTypes.string,
    explanation: PropTypes.string,
    report_target: PropTypes.string,
    target_id: PropTypes.number,
  }),
}
