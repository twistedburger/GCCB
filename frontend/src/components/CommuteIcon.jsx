import PropTypes from 'prop-types'
import {
  DirectionsCar,
  DirectionsBike,
  DirectionsBus,
  DirectionsWalk,
} from '@mui/icons-material'

const CommuteIcon = ({ transit_type }) => {
  const icons = {
    car: DirectionsCar,
    bike: DirectionsBike,
    bus: DirectionsBus,
    walk: DirectionsWalk,
  }

  const SelectedIcon = icons[transit_type]

  return (
    <div className="commute-icon" data-type={transit_type}>
      {SelectedIcon ? <SelectedIcon /> : null}
    </div>
  )
}

CommuteIcon.propTypes = {
  transit_type: PropTypes.oneOf(['car', 'bike', 'bus', 'walk']).isRequired,
}

export default CommuteIcon
