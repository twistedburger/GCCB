import PropTypes from 'prop-types'
import { useState } from 'react'
import GenericButton from './GenericButton'
import ConfirmationDialog from './ConfirmationDialog'
import TextBox from './TextBox'
import { moderationStrings } from '../locales/en/moderation'
import Select from 'react-select'
import { handleSubmit } from '../utils/ModeratorUtils'

/**
 * Component for moderator actions on reports and events
 *
 * @param {Object} information Information object
 * @param {func} setAlert Callback function for an alert when a report is submitted
 * @param {func} onSuccess Callback function if report submit succeeds
 * @param {string} mode Type of action - Report or Event
 * @returns {JSX.Element}
 */
export default function ModerationActions({
  information,
  setAlert,
  onSuccess,
  mode,
}) {
  const isReport = mode === 'report'
  const [confirmReport, setConfirmReport] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionDetail, setRejectionDetail] = useState('')
  const [detailError, setDetailError] = useState('')
  const invalidReports = moderationStrings.invalidReports.map(r => ({
    value: r,
    label: r,
  }))
  const invalidVerifications = moderationStrings.invalidVerifications.map(
    r => ({ value: r, label: r })
  )

  function handleCancel() {
    setConfirmReport(null)
    setRejectionReason('')
    setRejectionDetail('')
    setDetailError('')
  }

  const showActions = confirmReport === null

  return (
    <div className="flex flex-col ml-4 mr-2 gap-2">
      {/* Check and X buttons*/}
      {showActions && (
        <div className="flex flex-col">
          {/* Report details */}
          {isReport && information && (
            <div className="flex flex-col pt-2 px-1 gap-1">
              <div className="flex gap-2">
                <span className="text-xs font-semibold text-text-primary shrink-0">
                  {moderationStrings.reportReason}
                </span>
                <span className="text-xs text-text-secondary">
                  {information.reason}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-semibold text-text-primary shrink-0">
                  {moderationStrings.details}
                </span>
                <span className="text-xs text-text-secondary">
                  {information.explanation}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-row justify-end gap-1 m-1 mt-2">
            <GenericButton
              onClick={e => {
                e.stopPropagation()
                setConfirmReport('approve')
              }}
              unstyled={true}
              customStyling="bg-green-secondary border border-green-primary text-green-primary py-1 px-2 rounded-lg text-xs"
            >
              <span>Approve</span>
            </GenericButton>
            <GenericButton
              onClick={e => {
                e.stopPropagation()
                setConfirmReport('decline')
              }}
              unstyled={true}
              customStyling="bg-red-100 border border-red-500 text-red-500 py-1 px-2 rounded-lg text-xs"
            >
              <span>Reject</span>
            </GenericButton>
          </div>
        </div>
      )}

      {/* Valid report, confirmation dialog */}
      <div className="*:ml-13.75">
        <ConfirmationDialog
          isOpen={confirmReport === 'approve'}
          onClose={handleCancel}
          onConfirm={() =>
            handleSubmit(
              'approved',
              isReport,
              information,
              rejectionReason,
              rejectionDetail,
              setAlert,
              onSuccess
            )
          }
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
            onChange={e => {
              setRejectionReason(e.value)
              setRejectionDetail('')
              setDetailError('')
            }}
            placeholder="Select a reason..."
            menuPortalTarget={document.body}
            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          />

          {/* Textbox */}
          {rejectionReason === 'Other' && (
            <TextBox
              error={detailError}
              value={rejectionDetail}
              onChange={e => {
                setRejectionDetail(e.target.value)
                if (detailError) setDetailError('')
              }}
              multiline
              placeholder={'Please provide a reason for the invalid report...'}
            />
          )}

          {/* ok/cancel */}
          <div className="flex justify-end gap-1">
            <GenericButton
              onClick={() => {
                if (rejectionReason === 'Other' && rejectionDetail === '') {
                  setDetailError('Explanation for invalid report required.')
                  return
                }
                handleSubmit(
                  'rejected',
                  isReport,
                  information,
                  rejectionReason,
                  rejectionDetail,
                  setAlert,
                  onSuccess
                )
              }}
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
  information: PropTypes.object.isRequired,
  setAlert: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['report', 'event']).isRequired,
}
