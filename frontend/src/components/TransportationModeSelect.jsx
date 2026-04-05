import PropTypes from 'prop-types'
import { useState } from 'react'
import CommuteIcon from './CommuteIcon'

export default function TransportationModeSelect({
  selectedModes,
  onChange,
  multiple = true,
}) {
  const [transportationModes, setTransportationModes] = useState(
    Array.isArray(selectedModes)
      ? selectedModes
      : [selectedModes].filter(Boolean)
  )

  const modes = ['transit', 'bicycle', 'walk', 'car']

  const handleToggle = mode => {
    let nextState
    if (multiple) {
      nextState = transportationModes.includes(mode)
        ? transportationModes.filter(m => m !== mode)
        : [...transportationModes, mode]
    } else {
      nextState = transportationModes.includes(mode) ? [] : [mode]
    }

    setTransportationModes(nextState)
    onChange(multiple ? nextState : nextState[0] || null)
  }

  return (
    <div>
      <p className="pb-2 font-semibold">
        Transportation Mode{multiple ? 's' : ''}
      </p>
      <div className="flex flex-row gap-4">
        {modes.map(mode => (
          <CommuteIcon
            key={mode}
            type={mode}
            onClick={() => handleToggle(mode)}
            isSelected={transportationModes.includes(mode)}
            clickable
          />
        ))}
      </div>
    </div>
  )
}

TransportationModeSelect.propTypes = {
  selectedModes: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  onChange: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
}
