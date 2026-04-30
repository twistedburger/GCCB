import { moderationStrings } from '../locales/en/ComponentStrings/ModerationActionsStrings'

/**
 * Handle report submitting.
 *
 * @param {Object} data report data
 * @throws error if fetch fails or response has error
 * @returns {Object} response from server if succeeded
 */
export const submitReport = async data => {
  try {
    const response = await fetch(
      `${process.env.VITE_API_BASE_URL}/api/moderateReport`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Server Error: ${response.status}`)
    }
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error submitting report')
    throw error
  }
}

/**
 * Handle event verification.
 *
 * @param {Object} data report data
 * @throws error if fetch fails or response has error
 * @returns {Object} response from server if succeeded
 */
export const submitVerification = async data => {
  try {
    const response = await fetch(
      `${process.env.VITE_API_BASE_URL}/api/verifyEvent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Server Error: ${response.status}`)
    }
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error verifying event')
    throw error
  }
}

/**
 * Handles the submission of reports or event verifications. Opens an alert dialog on success or failure, and callsback on success
 *
 * @param {string} status Report status
 * @param {boolean} isReport Flag if the submission is for a report
 * @param {Object} information Information regarding the event or report
 * @param {string} rejectionReason Reason for rejecting
 * @param {string} rejectionDetail Details about the rejections
 * @param {func} setAlert Callback function for opening the alert dialog
 * @param {func} onSuccess Callback function for success of handling the report or event
 */
export const handleSubmit = async (
  status,
  isReport,
  information,
  rejectionReason,
  rejectionDetail,
  setAlert,
  onSuccess
) => {
  const data = isReport
    ? {
        report_id: information.id,
        report_target: information.report_target,
        target_id: information.target_id,
        rejection_reason: rejectionReason,
        rejection_detail: rejectionDetail,
        status: status,
      }
    : {
        event_id: information,
        status: status,
        rejection_reason: rejectionReason,
        rejection_detail: rejectionDetail,
      }
  try {
    isReport ? await submitReport(data) : await submitVerification(data)
    setAlert({
      type: 'success',
      text: isReport
        ? moderationStrings.submitReport
        : moderationStrings.submitEvent,
    })
    onSuccess()
  } catch {
    setAlert({
      type: 'error',
      text: moderationStrings.submitError,
    })
  }
}
