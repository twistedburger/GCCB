import PropTypes from 'prop-types'
import {
  DirectionsCar,
  DirectionsBike,
  DirectionsBus,
  DirectionsWalk,
} from '@mui/icons-material'

const CommuteIcon = ({ type, clickable = false, isSelected, onClick }) => {
  const icons = {
    car: DirectionsCar,
    bicycle: DirectionsBike,
    bus: DirectionsBus,
    walk: DirectionsWalk,
  }

  const SelectedIcon = icons[type]

  return (
    <div
      className={`commute-icon ${clickable ? 'cursor-pointer' : ''} ${clickable && isSelected ? 'selected' : ''}`}
      data-type={type}
      onClick={onClick}
    >
      {SelectedIcon ? <SelectedIcon /> : null}
    </div>
  )
}

CommuteIcon.propTypes = {
  type: PropTypes.oneOf(['car', 'bicycle', 'bus', 'walk']).isRequired,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
}

export default CommuteIcon
