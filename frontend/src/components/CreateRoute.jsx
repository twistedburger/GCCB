import PropTypes from 'prop-types'
import { useState } from 'react'
import TextBox from './TextBox'
import GenericButton from './GenericButton'
import LocationSearch from './LocationSearch'
import TransportationModeSelect from './TransportationModeSelect'

const CreateRoute = ({ initLoc, onSubmit }) => {
  const [routeName, setRouteName] = useState('')
  const [routeDesc, setRouteDesc] = useState('')
  const [transportationMode, setTransportationMode] = useState('')
  const [numPeople, setNumPeople] = useState(1)
  const [departTime, setDepartTime] = useState('')
  const [startLoc, setStartLoc] = useState(null)
  const [endLoc, setEndLoc] = useState(initLoc)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!routeName.trim()) newErrors.routeName = 'Route name is required'
    if (!transportationMode)
      newErrors.transportationMode = 'Select a transportation mode'
    if (!startLoc) newErrors.startLoc = 'Starting location is required'
    if (!endLoc) newErrors.endLoc = 'Destination is required'
    if (!departTime) newErrors.departTime = 'Departure time is required'
    return newErrors
  }

  const handleAddRoute = e => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    const routeData = {
      name: routeName,
      transportation_mode: transportationMode,
      num_people: numPeople,
      depart_time: departTime,
      start: startLoc,
      end: endLoc || initLoc,
      description: routeDesc,
    }

    console.log('Submitting route:', routeData)
    onSubmit(routeData)
  }

  return (
    <div className="space-y-4">
      <TextBox
        label="Route Name"
        value={routeName}
        onChange={e => setRouteName(e.target.value)}
        error={errors.routeName}
      />

      <TransportationModeSelect
        selectedModes={[]}
        onChange={modes => {
          setTransportationMode(modes[0] || '')
        }}
        multiple={false}
      />

      {transportationMode && (
        <div>
          <label className="text-text-primary text-sm font-semibold mb-1 block ml-1">
            Number of People
          </label>
          <input
            type="number"
            min="1"
            value={numPeople}
            onChange={e => setNumPeople(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 rounded-xl transition-all duration-200 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
              bg-gray-50 text-text-primary outline-none border border-transparent focus:border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      )}

      <div>
        <label className="text-text-primary text-sm font-semibold mb-1 block ml-1">
          Starting Location
        </label>
        <LocationSearch
          placeHolder="Enter starting location"
          className={`w-full flex justify-end rounded-xl bg-gray-50 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
            outline-none transition-all text-text-primary placeholder:text-secondary
            ${errors.startLoc ? 'border border-red-500' : 'focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100'}`}
          onSearch={location => setStartLoc(location)}
        />
        {errors.startLoc && (
          <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
            {errors.startLoc}
          </p>
        )}
      </div>
      <div>
        <label className="text-text-primary text-sm font-semibold mb-1 block ml-1">
          Destination
        </label>
        <LocationSearch
          defaultLocation={endLoc}
          placeHolder="Enter destination"
          className={`w-full flex justify-end rounded-xl bg-gray-50 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
            outline-none transition-all text-text-primary placeholder:text-secondary
            ${errors.endLoc ? 'border border-red-500' : 'focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100'}`}
          onSearch={location => setEndLoc(location)}
        />
        {errors.endLoc && (
          <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
            {errors.endLoc}
          </p>
        )}
      </div>

      <div className="border border-2 border-red-500">
        Display the selected route in mini map?
      </div>

      <div>
        <label
          className="text-sm font-semibold text-text-primary ml-1 mb-1.5 block"
          htmlFor="depart-time"
        >
          Departure Time
        </label>
        <input
          id="depart-time"
          type="datetime-local"
          value={departTime}
          onChange={e => setDepartTime(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl transition-all duration-200 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
             bg-gray-50 text-text-primary outline-none border
             ${errors.departTime ? 'border-red-500' : 'border-transparent focus:border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'}`}
        />
        {errors.departTime && (
          <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
            {errors.departTime}
          </p>
        )}
      </div>
      <TextBox
        label="Route Description"
        value={routeDesc}
        onChange={e => setRouteDesc(e.target.value)}
        multiline
      />

      <div className="flex justify-end">
        <GenericButton type="button" onClick={handleAddRoute}>
          Confirm Route
        </GenericButton>
      </div>
    </div>
  )
}

export default CreateRoute

CreateRoute.propTypes = {
  initLoc: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
}
