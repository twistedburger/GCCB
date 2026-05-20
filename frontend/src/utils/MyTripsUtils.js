import { myTripsStrings } from '../locales/en/MyTripsStrings'

const baseUrl = import.meta.env.VITE_API_BASE_URL
/**
 * Fetch all trips for the current user and split into active/completed.
 *
 * @param {Function} setActiveTrips Sets a user's active and to be completed trips
 * @param {Function} setCompletedTrips Sets a user's completed trips
 */
export async function fetchMyTrips(setActiveTrips, setCompletedTrips) {
  const response = await fetch(`${baseUrl}/api/myTrips`, {
    credentials: 'include',
  })

  const data = await response.json()
  if (!Array.isArray(data)) return

  const taggedData = data.map(trip => ({
    ...trip,
    isJoined: true,
  }))

  setActiveTrips(taggedData.filter(trip => !trip.completed))
  setCompletedTrips(taggedData.filter(trip => trip.completed))
}

/**
 * Execute a leave, incomplete, or complete action for a trip.
 *
 * @param {{ type: string, trip: object }} pendingAction The action to be done, including the action type and target route
 * @param {Function} setAlert Sets the error or success alert
 * @param {Function} setActiveTrips Sets a user's active and to be completed trips
 * @param {Function} setCompletedTrips Sets a user's completed trips
 * @param {Function} setPendingAction Clears the pending action after it resolves
 */
export async function confirmTripAction(
  pendingAction,
  setAlert,
  setActiveTrips,
  setCompletedTrips,
  setPendingAction
) {
  const { type, trip } = pendingAction
  if (!trip) return

  if (type === 'leave' || type === 'incomplete') {
    await fetch(`${baseUrl}/api/routes/${trip.id}/leave`, {
      method: 'DELETE',
      credentials: 'include',
    })

    setAlert({
      message:
        type === 'leave'
          ? myTripsStrings.leaveSuccess
          : myTripsStrings.didntGoSuccess,
      type: 'success',
    })
  } else if (type === 'complete') {
    await fetch(`${baseUrl}/api/completeRoute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ routeID: trip.id }),
    })

    setAlert({
      message: myTripsStrings.completionSuccess,
      type: 'success',
    })
  }

  await fetchMyTrips(setActiveTrips, setCompletedTrips)
  setPendingAction({ type: null, trip: null })
}

/**
 * Return the confirmation dialog title for the given action type.
 *
 * @param {string} type An action type: leave, incomplete, or complete
 * @returns {string} The title for the confirmation dialog
 */
export function getConfirmationTitle(type) {
  if (type === 'leave') return myTripsStrings.leaveTitle
  if (type === 'incomplete') return myTripsStrings.didntGoTitle
  return myTripsStrings.completeTitle
}

/**
 * Return the confirmation dialog body text for the given action type.
 *
 * @param {string} type An action type: leave, incomplete, or complete
 * @returns {string} The body text for the confirmation dialog
 */
export function getConfirmationBody(type) {
  if (type === 'leave') return myTripsStrings.confirmationLeave
  if (type === 'incomplete') return myTripsStrings.confirmationDidntGo
  return myTripsStrings.confirmationComplete
}

/**
 * Returns true if the report/join controls should be hidden
 * (i.e. departure time is in the past).
 *
 * @param {string|Date} departTime The trip's departure time to compare against the current time
 * @returns {boolean}
 */
export function shouldHideReportJoin(departTime) {
  return new Date(departTime).getTime() < Date.now()
}
