import PropTypes from 'prop-types'
import { useState } from 'react'
import { CheckOutlined, CloseOutlined } from '@mui/icons-material'
import GenericButton from '../../components/GenericButton'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import { moderationStrings } from '../../locales/en/moderation'
import Select from 'react-select'

export default function ModerationActions({ reportInformation }) {
  const [confirmReport, setConfirmReport] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionDetail, setRejectionDetail] = useState('')
  const invalidReasons = [
    'No Violation',
    'Duplicate Report',
    'Insufficient Evidence',
    'Misuse',
    'Other',
  ].map(r => ({ value: r, label: r }))

  async function handleConfirm() {}

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
          className={`flex gap-1 ${reportInformation ? 'justify-between' : 'justify-end'}`}
        >
          {reportInformation && (
            <div className="flex flex-col pt-2 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary">
                  {moderationStrings.reportReason}
                </span>
                <span className="text-xs text-text-secondary">
                  {reportInformation.reason}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-text-primary shrink-0">
                  {moderationStrings.details}
                </span>
                <span className="text-xs text-text-secondary">
                  {reportInformation.explanation}
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
          onConfirm={handleConfirm}
          title="Approve"
          confirmText={moderationStrings.ok}
          cancelText={moderationStrings.cancel}
          variant="primary"
        >
          {moderationStrings.confirmApprove(
            reportInformation ? 'report' : 'event'
          )}
        </ConfirmationDialog>
      </div>

      {/* Invalid report, moderator must add a reason (dropdown or other + text) */}
      {confirmReport === 'decline' && (
        <div className="flex flex-col gap-2 py-2">
          <span className="text-xs font-semibold text-text-primary">
            Reason for invalid report
          </span>

          {/* Dropdown */}
          <Select
            options={invalidReasons}
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
              onClick={e => {
                e.stopPropagation()
                handleConfirm()
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
  reportInformation: PropTypes.shape({
    id: PropTypes.number,
    reason: PropTypes.string,
    explanation: PropTypes.string,
    report_target: PropTypes.string,
  }),
}
