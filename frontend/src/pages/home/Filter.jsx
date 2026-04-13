import GenericButton from '../../components/GenericButton'
import GenericToggle from '../../components/GenericToggle'
import { Cancel } from '@mui/icons-material'
import { DateTimePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Slider } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import TransportationModeSelect from '../../components/TransportationModeSelect.jsx'

/**
 * Displays the Filter page
 * @returns {JSX.Element}
 */
export default function Filter() {
  const navigate = useNavigate()
  const { filters, setFilters } = useOutletContext()

  const [isClosing, setIsClosing] = useState(false)
  const [transportationModes, setTransportationModes] = useState(
    filters?.transportationModes ?? []
  )
  const [time, setTime] = useState(filters?.time ? dayjs(filters.time) : null)
  const [radius, setRadius] = useState(filters?.radius ?? 500)
  const [verifiedEventsOnly, setVerifiedEventsOnly] = useState(
    filters?.verifiedEventsOnly ?? false
  )
  const [mainEventsOnly, setMainEventsOnly] = useState(
    filters?.mainEventsOnly ?? true
  )

  const closeWithAnimation = (updatedFilters = null) => {
    setIsClosing(true)
    setTimeout(() => {
      navigate('/', { state: { filters: updatedFilters } })
    }, 300)
  }

  const handleApply = () => {
    const updatedFilters = {
      time: time ? time.format('YYYY-MM-DD HH:mm:ss') : null,
      radius,
      verifiedEventsOnly,
      mainEventsOnly,
      transportationModes,
    }
    setFilters(updatedFilters)
    closeWithAnimation(updatedFilters)
  }

  const handleCancel = () => {
    closeWithAnimation()
  }

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background-off-white ml-13.75 ${isClosing ? 'sheet-exit' : 'sheet-enter'}`}
        style={{ maxHeight: '100dvh', overflowY: 'auto' }}
      >
        <div className="px-6 py-4 flex flex-col justify-between items-center h-screen">
          <div className="flex-1 w-full">
            <div className="flex justify-between">
              <p className="text-2xl font-medium pb-2">Filters</p>
              <GenericButton
                onClick={handleCancel}
                unstyled={true}
                customStyling="text-text-primary scale-110 pb-4"
              >
                <Cancel />
              </GenericButton>
            </div>
            <TransportationModeSelect
              selectedModes={transportationModes}
              onChange={setTransportationModes}
              multiple={true}
            />
            <p className="py-2 font-semibold">Time</p>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={time}
                onChange={setTime}
                views={['year', 'month', 'day', 'hours', 'minutes']}
                slotProps={{
                  textField: {
                    sx: {
                      width: '100%',
                      '& fieldset': { borderRadius: '14px' },
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
                min={500}
                max={2000}
                shiftStep={250}
                step={250}
                marks
              />
            </div>
            <p className="pb-2 font-semibold">More Filters</p>
            <div>
              <GenericButton
                onClick={() => setVerifiedEventsOnly(!verifiedEventsOnly)}
                unstyled={true}
                customStyling="mb-4 bg-white py-1.5 px-4 text-sm font-medium rounded-xl shadow-light-grey shadow-sm"
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
          <div className="pb-2 pt-4 w-full">
            <GenericButton
              onClick={() => {
                setTime(null)
                setRadius(500)
                setVerifiedEventsOnly(false)
                setMainEventsOnly(true)
                setTransportationModes([])
              }}
              customStyling="bg-white !text-blue-primary shadow-light-grey shadow-sm"
            >
              Clear Filters
            </GenericButton>
            <GenericButton onClick={handleApply}>Apply Filters</GenericButton>
          </div>
        </div>
      </div>
    </>
  )
}
