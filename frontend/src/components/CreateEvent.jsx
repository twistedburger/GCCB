import PropTypes from 'prop-types'
import { useState } from 'react'
import { Close } from '@mui/icons-material'
import TextBox from './TextBox'
import GenericButton from './GenericButton'
import CreateRoute from './CreateRoute'
import LocationSearch from './LocationSearch'
import RouteCard from './RouteCard'

const CreateEvent = ({
  initLoc,
  // onSubmit
}) => {
  const [addedRoutes, setAddedRoutes] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [addRoute, setAddRoute] = useState(false)
  const [eventName, setEventName] = useState('')
  const [datetime, setDatetime] = useState('')
  const [eventDesc, setEventDesc] = useState('')
  const [errors, setErrors] = useState({})

  const handleRouteSubmit = route => {
    const routeWithId = { ...route, id: crypto.randomUUID() }
    setAddedRoutes([...addedRoutes, routeWithId])
  }

  const removeRoute = id => {
    setAddedRoutes(addedRoutes.filter(route => route.id !== id))
  }

  const validate = () => {
    const newErrors = {}
    if (!eventName.trim()) newErrors.eventName = 'Event name is required'
    if (!selectedPlace) newErrors.location = 'Location is required'
    if (!datetime) newErrors.datetime = 'Date & time is required'
    return newErrors
  }

  const handleCreateEvent = e => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    const eventData = {
      title: eventName,
      event_time: datetime,
      location: selectedPlace,
      description: eventDesc,
      routes: addedRoutes,
    }
    console.log('Event created: ' + JSON.stringify(eventData))
    // api call to submit eventData
    // onSubmit() to close modal after successful submission
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create a New Event</h1>
      <form className="space-y-4" onSubmit={handleCreateEvent}>
        <div>
          <TextBox
            label="Event Name"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            error={errors.eventName}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-1 block ml-1">
            Location
          </label>
          <LocationSearch
            className={`w-full flex justify-end rounded-xl bg-gray-50 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
            outline-none transition-all text-text-primary placeholder:text-secondary 
            ${errors.location ? 'border border-red-500' : 'focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100'}`}
            onSearch={location => setSelectedPlace(location)}
            placeHolder="Enter event location"
            disabled={addRoute || addedRoutes.length > 0}
          />
          {errors.location && (
            <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
              {errors.location}
            </p>
          )}
        </div>

        <div>
          <label
            className="text-sm font-semibold text-text-primary ml-1 mb-1.5 block"
            htmlFor="event-datetime"
          >
            Event Date & Time
          </label>
          <input
            id="event-datetime"
            type="datetime-local"
            value={datetime}
            onChange={e => setDatetime(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl transition-all duration-200 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
             bg-gray-50 text-text-primary outline-none border
             ${errors.datetime ? 'border-red-500' : 'border-transparent focus:border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'}`}
          />
          {errors.datetime && (
            <p className="flex justify-end text-red-500 text-xs ml-1 mt-1">
              {errors.datetime}
            </p>
          )}
        </div>

        <div>
          <TextBox
            label="Event Description"
            value={eventDesc}
            onChange={e => setEventDesc(e.target.value)}
            multiline
          />
        </div>

        {addedRoutes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Added Routes</h2>
            {addedRoutes.map(route => (
              <div key={route.id} className="relative">
                <GenericButton
                  unstyled={true}
                  customStyling="absolute top-2 right-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                >
                  <Close
                    fontSize="small"
                    onClick={() => removeRoute(route.id)}
                  />
                </GenericButton>
                <RouteCard
                  key={route.id}
                  route={route}
                  individualView={true}
                  createMode={true}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center items-center space-x-2">
          {addRoute ? (
            <div className="relative w-full border border-gray-300 p-4 rounded-xl">
              <GenericButton
                unstyled={true}
                onClick={() => setAddRoute(false)}
                customStyling="absolute top-2 right-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
              >
                <Close fontSize="medium" />
              </GenericButton>
              <CreateRoute
                initLoc={selectedPlace ? selectedPlace : initLoc}
                onSubmit={route => {
                  handleRouteSubmit(route)
                  setAddRoute(false)
                }}
              />
            </div>
          ) : (
            <GenericButton type="button" onClick={() => setAddRoute(true)}>
              Add a Route
            </GenericButton>
          )}
        </div>

        <div className="flex justify-end">
          <GenericButton type="submit">Create Event</GenericButton>
        </div>
      </form>
    </div>
  )
}

export default CreateEvent

CreateEvent.propTypes = {
  initLoc: PropTypes.string,
  // onSubmit: PropTypes.func.isRequired,
}
