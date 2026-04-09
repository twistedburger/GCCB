import PropTypes from 'prop-types'
import { useState } from 'react'
import { CheckOutlined, CloseOutlined } from '@mui/icons-material'
import GenericButton from './GenericButton'
import ConfirmationDialog from './ConfirmationDialog'
import TextBox from './TextBox'
import { moderationStrings } from '../locales/en/ComponentStrings/ModerationActionsStrings'
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
  const invalidReports = moderationStrings.invalidReports.map(reason => ({
    value: reason,
    label: reason,
  }))
  const invalidVerifications = moderationStrings.invalidVerifications.map(
    reason => ({ value: reason, label: reason })
  )

  function handleCancel() {
    setConfirmReport(null)
    setRejectionReason('')
    setRejectionDetail('')
    setDetailError('')
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
          title={moderationStrings.approve}
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
            {moderationStrings.rejectionLabel(isReport ? 'report' : 'event')}
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
            placeholder={moderationStrings.selectReason}
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
              placeholder={moderationStrings.reasonInvalid}
            />
          )}

          {/* ok/cancel */}
          <div className="flex justify-end gap-1">
            <GenericButton
              onClick={() => {
                if (rejectionReason === 'Other' && rejectionDetail === '') {
                  setDetailError(moderationStrings.explanationInvalidRequired)
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
