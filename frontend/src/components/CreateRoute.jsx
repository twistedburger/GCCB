import PropTypes from 'prop-types'
import { useState } from 'react'
import TextBox from './TextBox'
import GenericButton from './GenericButton'
import LocationSearch from './LocationSearch'

const CreateRoute = ({ initLoc, onSubmit }) => {
  const [routeName, setRouteName] = useState('')
  const [routeDesc, setRouteDesc] = useState('')
  const [departTime, setDepartTime] = useState('')
  const [startLoc, setStartLoc] = useState(null)
  const [endLoc, setEndLoc] = useState(initLoc)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!routeName.trim()) newErrors.routeName = 'Route name is required'
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
      />
      {errors.routeName && (
        <p className="text-red-500 text-xs ml-1">{errors.routeName}</p>
      )}

      <label className="text-text-primary text-sm font-semibold mb-1 block ml-1">
        Starting Location
      </label>
      <LocationSearch
        placeHolder="Enter starting location"
        className="w-full flex justify-end rounded-xl bg-gray-50 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
             outline-none focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all
              text-text-primary placeholder:text-secondary"
        onSearch={location => setStartLoc(location)}
      />
      {errors.startLoc && (
        <p className="text-red-500 text-xs ml-1">{errors.startLoc}</p>
      )}

      <label className="text-text-primary text-sm font-semibold mb-1 block ml-1">
        Destination
      </label>
      <LocationSearch
        defaultLocation={endLoc}
        placeHolder="Enter destination"
        className="w-full flex justify-end rounded-xl bg-gray-50 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
             outline-none focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all
              text-text-primary placeholder:text-secondary"
        onSearch={location => setEndLoc(location)}
      />
      {errors.endLoc && (
        <p className="text-red-500 text-xs ml-1">{errors.endLoc}</p>
      )}

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
        className="w-full px-4 py-3 rounded-xl bg-gray-50 ..."
      />
      {errors.departTime && (
        <p className="text-red-500 text-xs ml-1">{errors.departTime}</p>
      )}

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
