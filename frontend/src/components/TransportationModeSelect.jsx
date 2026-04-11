import PropTypes from 'prop-types'
import { useState } from 'react'
import CommuteIcon from './CommuteIcon'
import { transportationModeSelectStrings } from '../locales/en/ComponentStrings/TransportationModeSelectStrings'

const MODES = ['transit', 'bicycle', 'walk', 'car']

/**
 * A component for selecting transportation modes.
 * @param {Object} props
 * @param {string | string[]} props.selectedModes - The currently selected transportation modes.
 * @param {Function} props.onChange - A function to be called when the selected modes change.
 * @param {boolean} props.multiple - Flag indicating if multiple modes can be selected.
 * @returns {JSX.Element}
 */

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
        {transportationModeSelectStrings.label(multiple)}
      </p>
      <div className="flex flex-row gap-4">
        {MODES.map(mode => (
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
