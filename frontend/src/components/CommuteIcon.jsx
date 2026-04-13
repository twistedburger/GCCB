import PropTypes from 'prop-types'
import {
  DirectionsCar,
  DirectionsBike,
  DirectionsBus,
  DirectionsWalk,
} from '@mui/icons-material'

const ICONS = {
  car: DirectionsCar,
  bicycle: DirectionsBike,
  transit: DirectionsBus,
  walk: DirectionsWalk,
}

/**
 * Component to display a commute method icon.
 *
 * @param {string} type - The commute method type.
 * @param {boolean} [clickable=false] - Whether the icon is clickable.
 * @param {boolean} [isSelected=false] - Whether the icon is selected.
 * @param {Function} [onClick] - The function to call when the icon is clicked.
 * @returns {JSX.Element}
 */

const CommuteIcon = ({ type, clickable = false, isSelected, onClick }) => {
  const SelectedIcon = ICONS[type]

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
  type: PropTypes.oneOf(['car', 'bicycle', 'transit', 'walk']).isRequired,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
}

export default CommuteIcon
