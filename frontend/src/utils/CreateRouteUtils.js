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

/**
 * Formats a Date object into a local datetime string compatible with datetime-local inputs.
 *
 * @param {Date} date - The date to format.
 * @returns {string} A datetime string in the format "YYYY-MM-DDTHH:MM".
 */
export const formatDateTimeInput = date => {
  const pad = n => String(n).padStart(2, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
