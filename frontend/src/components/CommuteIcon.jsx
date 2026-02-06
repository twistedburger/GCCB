import PropTypes from 'prop-types'
import {
  DirectionsCar,
  DirectionsBike,
  DirectionsBus,
  DirectionsWalk,
} from '@mui/icons-material'

const CommuteIcon = ({ type }) => {
  const icons = {
    car: DirectionsCar,
    bike: DirectionsBike,
    bus: DirectionsBus,
    walk: DirectionsWalk,
  }

  const SelectedIcon = icons[type]

  return (
    <div className="commute-icon" data-type={type}>
      {SelectedIcon ? <SelectedIcon /> : null}
    </div>
  )
}

CommuteIcon.propTypes = {
  type: PropTypes.oneOf(['car', 'bike', 'bus', 'walk']).isRequired,
}

export default CommuteIcon
