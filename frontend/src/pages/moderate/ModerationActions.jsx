import PropTypes from 'prop-types'
import { useState } from 'react'
import { CheckOutlined, CloseOutlined } from '@mui/icons-material'
import GenericButton from '../../components/GenericButton'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import { moderationStrings } from '../../locales/en/moderation'
import Select from 'react-select'

export default function ModerationActions({
  information,
  onSuccess,
  setAlert,
  mode,
}) {
  const isReport = mode === 'report'
  const [confirmReport, setConfirmReport] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionDetail, setRejectionDetail] = useState('')
  const invalidReports = moderationStrings.invalidReports.map(r => ({
    value: r,
    label: r,
  }))
  const invalidVerifications = moderationStrings.invalidVerifications.map(
    r => ({ value: r, label: r })
  )

  const submitReport = async data => {
    try {
      const response = await fetch('http://localhost:3000/api/moderateReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

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

  const submitVerification = async data => {
    try {
      const response = await fetch('http://localhost:3000/api/verifyEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

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

  const handleSubmit = async status => {
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
    console.log(data)
    try {
      isReport ? await submitReport(data) : await submitVerification(data)
      setAlert({
        type: 'success',
        text: isReport
          ? 'Report submitted successfully.'
          : 'Event verified successfully.',
        visible: true,
      })
      setTimeout(() => {
        setAlert(prev => (prev ? { ...prev, visible: false } : null))
        onSuccess?.()
      }, 2000)
    } catch {
      setAlert({
        type: 'error',
        text: 'Something went wrong. Please try again.',
        visible: true,
      })
      setTimeout(() => {
        setAlert(prev => (prev ? { ...prev, visible: false } : null))
      }, 2000)
    }
  }

  function handleCancel() {
    setConfirmReport(null)
    setRejectionReason('')
    setRejectionDetail('')
  }

  const showActions = confirmReport === null

  return (
    <div className="flex flex-col mb-2 ml-4 mr-2 gap-2">
      {/* Check and X buttons*/}
      {showActions && (
        <div
          className={`flex gap-1 ${isReport && information ? 'justify-between' : 'justify-end'}`}
        >
          {isReport && information && (
            <div className="flex flex-col pt-2 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary">
                  {moderationStrings.reportReason}
                </span>
                <span className="text-xs text-text-secondary">
                  {information.reason}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-text-primary shrink-0">
                  {moderationStrings.details}
                </span>
                <span className="text-xs text-text-secondary">
                  {information.explanation}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-row justify-end">
            <GenericButton
              onClick={e => {
                e.stopPropagation()
                setConfirmReport('approve')
              }}
              unstyled={true}
              customStyling="text-text-secondary"
            >
              <CheckOutlined fontSize="large" />
            </GenericButton>
            <GenericButton
              onClick={e => {
                e.stopPropagation()
                setConfirmReport('decline')
              }}
              unstyled={true}
              customStyling="text-text-secondary"
            >
              <CloseOutlined fontSize="large" />
            </GenericButton>
          </div>
        </div>
      )}

      {/* Valid report, confirmation dialog */}
      <div className="*:ml-13.75">
        <ConfirmationDialog
          isOpen={confirmReport === 'approve'}
          onClose={handleCancel}
          onConfirm={() => handleSubmit('approved')}
          title="Approve"
          confirmText={moderationStrings.ok}
          cancelText={moderationStrings.cancel}
          variant="primary"
        >
          {moderationStrings.confirmApprove(isReport ? 'report' : 'event')}
        </ConfirmationDialog>
      </div>

      {/* Invalid, moderator must add a reason (dropdown or other + text) */}
      {confirmReport === 'decline' && (
        <div className="flex flex-col gap-2 py-2 px-2">
          <span className="text-xs font-semibold text-text-primary">
            {`Reason for invalid ${isReport ? 'report' : 'verification'}`}
          </span>

          {/* Dropdown */}
          <Select
            options={isReport ? invalidReports : invalidVerifications}
            value={
              rejectionReason
                ? { value: rejectionReason, label: rejectionReason }
                : null
            }
            onChange={e => setRejectionReason(e.value)}
            placeholder="Select a reason..."
            menuPortalTarget={document.body}
            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          />

          {/* Textbox */}
          {rejectionReason === 'Other' && (
            <textarea
              value={rejectionDetail}
              onChange={e => setRejectionDetail(e.target.value)}
              placeholder="Please describe the reason..."
              className="text-xs border border-zinc-300 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-blue-primary resize-none h-20"
            />
          )}

          {/* ok/cancel */}
          <div className="flex justify-end gap-1">
            <GenericButton
              onClick={() => handleSubmit('rejected')}
              unstyled={true}
              customStyling="text-xs bg-red-700 text-white font-medium px-4 py-1 rounded-lg"
            >
              {moderationStrings.ok}
            </GenericButton>
            <GenericButton
              onClick={e => {
                e.stopPropagation()
                handleCancel()
              }}
              unstyled={true}
              customStyling="text-xs bg-white text-medium-grey border border-zinc-300 font-medium px-4 py-1 rounded-lg"
            >
              {moderationStrings.cancel}
            </GenericButton>
          </div>
        </div>
      )}
    </div>
  )
}

ModerationActions.propTypes = {
  information: PropTypes.object,
  onSuccess: PropTypes.func,
  setAlert: PropTypes.func,
  mode: PropTypes.oneOf(['report', 'event']).isRequired,
}
