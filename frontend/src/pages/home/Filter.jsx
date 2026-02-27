import CommuteIcon from '../../components/CommuteIcon'
import GenericButton from '../../components/GenericButton'
import GenericToggle from '../../components/GenericToggle'
import { Cancel } from '@mui/icons-material'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Slider } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import { useState } from 'react'

export default function Filter() {
  const [time, setTime] = useState(null)
  const [radius, setRadius] = useState(500)
  const [verifiedEventsOnly, setVerifiedEventsOnly] = useState(true)
  const [mainEventsOnly, setMainEventsOnly] = useState(true)

  return (
    <div className="bg-background-off-white px-6 py-4">
      <div className="flex justify-between">
        <p className="text-2xl font-medium pb-2">Filters</p>
        <GenericButton
          unstyled={true}
          customStyling={'text-text-primary scale-110 pb-4'}
        >
          <Cancel />
        </GenericButton>
      </div>
      <p className="pb-2 font-semibold">Transportation Modes</p>
      <div className="flex flex-row gap-4">
        <CommuteIcon type={'bus'} />
        <CommuteIcon type={'bicycle'} />
        <CommuteIcon type={'walk'} />
        <CommuteIcon type={'car'} />
      </div>
      <p className="py-2 font-semibold">Departure Time</p>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimePicker
          value={time}
          onChange={setTime}
          slotProps={{
            textField: {
              sx: {
                width: '100%',
                '& fieldset': {
                  borderRadius: '14px',
                },
              },
            },
          }}
        />
      </LocalizationProvider>
      <div className="flex flex-row items-center gap-1 pt-2">
        <p className="font-semibold">Radius •</p>
        <p className="text-sm text-text-secondary">{radius} m</p>
      </div>
      <div className="pr-2">
        <Slider
          value={radius}
          onChange={(e, newValue) => setRadius(newValue)}
          min={100}
          max={2000}
          shiftStep={100}
          step={100}
          marks
        />
      </div>
      <p className="pb-2 font-semibold">More Filters</p>
      <div>
        <GenericButton
          onClick={() => setVerifiedEventsOnly(!verifiedEventsOnly)}
          unstyled={true}
          customStyling={
            'mb-4 bg-white py-1.5 px-4 text-sm font-medium rounded-xl shadow-light-grey shadow-sm'
          }
        >
          {verifiedEventsOnly
            ? '✓ Show Verified Events Only'
            : 'Show Verified Events Only'}
        </GenericButton>
        <GenericToggle
          value={mainEventsOnly}
          onChange={setMainEventsOnly}
          labels={['Display Main Events', 'Display Individual Routes']}
        />
      </div>
    </div>
  )
}
