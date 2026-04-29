/**
 * Validates if the departure time is before the event time.
 *
 * @returns {string|null} - Returns an error message string if invalid, or null if valid.
 */

export const getDepartureTimeError = (departTime, eventTime, errorMessage) => {
  if (!departTime || !eventTime) return null

  const departure = new Date(departTime)
  const event = new Date(eventTime)

  if (departure > event) {
    const formattedEventTime = event.toLocaleString([], {
      dateStyle: 'short',
      timeStyle: 'short',
    })
    return `${errorMessage} (${formattedEventTime})`
  }

  return null
}
