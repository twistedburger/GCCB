import PropTypes from 'prop-types'
import { useState } from 'react'
import { Close } from '@mui/icons-material'
import TextBox from './TextBox'
import GenericButton from './GenericButton'
import CreateRoute from './CreateRoute'
import LocationSearch from './LocationSearch'
import RouteCard from './RouteCard'
import ConfirmationDialog from './ConfirmationDialog'
import { createEventStrings } from '../locales/en/ComponentStrings/CreateEventStrings'

const CreateEvent = ({ initLoc, onSubmit }) => {
  const [addedRoutes, setAddedRoutes] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [selectedLatLng, setSelectedLatLng] = useState(null)
  const [banner, setBanner] = useState('')
  const [placeId, setPlaceId] = useState('')
  const [addRoute, setAddRoute] = useState(false)
  const [eventName, setEventName] = useState('')
  const [datetime, setDatetime] = useState('')
  const [eventDesc, setEventDesc] = useState('')
  const [errors, setErrors] = useState({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const toggleRouteJoin = id => {
    setAddedRoutes(prev =>
      prev.map(route =>
        route.id === id ? { ...route, isJoined: !route.isJoined } : route
      )
    )
  }

  const handleRouteSubmit = route => {
    const routeWithId = {
      ...route,
      id: crypto.randomUUID(),
      isJoined: false,
    }
    setAddedRoutes([...addedRoutes, routeWithId])
  }

  const removeRoute = id => {
    setAddedRoutes(addedRoutes.filter(route => route.id !== id))
  }

  const validate = () => {
    const newErrors = {}
    if (!eventName.trim())
      newErrors.eventName = createEventStrings.eventNameRequired
    if (!selectedPlace) newErrors.location = createEventStrings.locationRequired
    if (!datetime) newErrors.datetime = createEventStrings.dateRequired
    return newErrors
  }

  const createEvent = async eventData => {
    try {
      const response = await fetch('http://localhost:3000/api/createEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error ||
            `${createEventStrings.serverError} ${response.status}`
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(createEventStrings.eventHelperError, error)
      throw error
    }
  }

  const handleConfirmSubmit = async () => {
    setIsDialogOpen(false)

    try {
      const eventData = {
        title: eventName,
        eventTime: datetime,
        location: selectedPlace,
        latitude: selectedLatLng[0],
        longitude: selectedLatLng[1],
        banner: banner,
        placeId: placeId,
        description: eventDesc,
        verified: false,
        needApproval: false,
      }

      const { id: newEventId } = await createEvent(eventData)

      if (addedRoutes.length > 0) {
        const routePromises = addedRoutes.map(route =>
          createRoute(newEventId, route)
        )
        await Promise.all(routePromises)
      }

      onSubmit({
        success: true,
        message: createEventStrings.creationSuccess,
        eventId: newEventId,
      })
    } catch (error) {
      console.error(createEventStrings.errorCreatingEvent, error)
      onSubmit({
        success: false,
        message: error.message || createEventStrings.creationFailed,
      })
    }
  }

  const createRoute = async (eventId, routeData, creatorId) => {
    try {
      const response = await fetch('http://localhost:3000/api/createRoute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventId,
          ...routeData,
          creatorId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error ||
            `${createEventStrings.routeCreationFailed} ${response.status}`
        )
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error(createEventStrings.errorCreatingRoute, error)
      throw error
    }
  }

  const handleEventSubmit = async e => {
    e.preventDefault()

    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsDialogOpen(true)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {createEventStrings.createEventTitle}
      </h1>
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmSubmit}
        title={createEventStrings.confirmCreationTitle}
      >
        {createEventStrings.confirmCreationMessage(
          eventName,
          addedRoutes.length
        )}
      </ConfirmationDialog>

      <form className="space-y-4" onSubmit={handleEventSubmit}>
        <div>
          <TextBox
            label={createEventStrings.nameLabel}
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            error={errors.eventName}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-1 block ml-1">
            {createEventStrings.locationLabel}
          </label>
          <LocationSearch
            className={`w-full flex justify-end rounded-xl bg-gray-50 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
            outline-none transition-all text-text-primary placeholder:text-secondary 
            ${errors.location ? 'border border-red-500' : 'focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100'}`}
            onSearch={(location, latitude, longitude, banner, placeId) => {
              setSelectedPlace(location)
              setSelectedLatLng([latitude, longitude])
              setBanner(banner)
              setPlaceId(placeId)
            }}
            placeHolder={createEventStrings.eventLocationPlaceholder}
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
            {createEventStrings.dateLabel}
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
            label={createEventStrings.descriptionLabel}
            value={eventDesc}
            onChange={e => setEventDesc(e.target.value)}
            multiline
          />
        </div>

        {addedRoutes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {createEventStrings.addedRoutesTitle}
            </h2>
            {addedRoutes.map(route => (
              <div key={route.id} className="relative">
                <GenericButton
                  unstyled={true}
                  customStyling="absolute top-2 right-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                  onClick={() => removeRoute(route.id)}
                >
                  <Close fontSize="small" />
                </GenericButton>
                <RouteCard
                  key={route.id}
                  route={route}
                  isDraft={true}
                  individualView={true}
                  onToggleJoin={toggleRouteJoin}
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
              {createEventStrings.addRoute}
            </GenericButton>
          )}
        </div>

        <div className="flex justify-end">
          <GenericButton type="submit">
            {createEventStrings.createEvent}
          </GenericButton>
        </div>
      </form>
    </div>
  )
}

export default CreateEvent

CreateEvent.propTypes = {
  initLoc: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
}
