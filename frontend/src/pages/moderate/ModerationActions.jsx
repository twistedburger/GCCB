import PropTypes from 'prop-types'
import { useState } from 'react'
import { CheckOutlined, CloseOutlined } from '@mui/icons-material'
import GenericButton from '../../components/GenericButton.jsx'

export default function ModerationActions({ reportInformation }) {
  const [confirmReport, setConfirmReport] = useState(null)

  async function handleConfirm() {}
  return (
    <>
      <div className="flex justify-between gap-1 mb-2 mx-6">
        <div className="flex flex-col pt-2 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-primary">
              Report Reason:
            </span>
            <span className="text-xs text-text-secondary">
              {reportInformation.reason}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-text-primary shrink-0">
              Details:
            </span>
            <span className="text-xs text-text-secondary">
              {reportInformation.explanation}
            </span>
          </div>
        </div>

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

      <div
        className={`overflow-hidden transition-all duration-500 ${
          confirmReport ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-text-secondary text-xs px-6">
          {confirmReport === 'approve'
            ? `This action cannot be undone. Are you sure you want to approve this report?`
            : `This action cannot be undone. Are you sure you want to reject this report?`}
        </p>
        <div className="flex justify-end gap-1 px-6 py-2">
          <GenericButton
            onClick={e => {
              e.stopPropagation()
              handleConfirm()
            }}
            unstyled={true}
            customStyling="text-xs bg-blue-primary text-white font-medium px-4 py-1 rounded-lg"
          >
            OK
          </GenericButton>
          <GenericButton
            onClick={e => {
              e.stopPropagation()
              setConfirmReport(null)
            }}
            unstyled={true}
            customStyling="text-xs bg-white text-medium-grey border-1 font-medium px-4 py-1 rounded-lg"
          >
            Cancel
          </GenericButton>
        </div>
      </div>
    </>
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
