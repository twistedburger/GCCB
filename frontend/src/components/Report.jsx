import GenericButton from './GenericButton'
import TextBox from './TextBox'
import Select from 'react-select'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { reportStrings } from '../locales/en/ComponentStrings/ReportStrings'

/**
 * A reporting form component used to flag inappropriate content or users.
 * Sends data to the moderator review queue and provides feedback via alerts.
 *
 * @param {string} type - The category of the entity being reported (e.g., 'user', 'event', 'route').
 * @param {string|number} targetId - The unique database ID of the entity being reported.
 * @param {Function} onClose - Callback function to close the reporting modal or view.
 * @param {Function} setAlert - State setter to trigger a global success or error notification.
 * @returns {JSX.Element}
 */

export default function Report({ type, targetId, onClose, setAlert }) {
  const reasonMenu = reportStrings.reportReasonMenu.map(report => ({
    value: report,
    label: report,
    textvalue: report,
  }))

  const [reason, setReason] = useState(reasonMenu[0].value)
  const [explanation, setExplanation] = useState('')
  const [explanationError, setExplanationError] = useState('')

  const handleSubmit = async () => {
    if (!explanation.trim()) {
      setExplanationError(reportStrings.provideExplanation)
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type, targetId, reason, explanation }),
        }
      )

      // TODO: Use Alert component
      if (response.ok) {
        onClose()
        setAlert({ type: 'success', text: reportStrings.reportSuccess })
      }
    } catch {
      setAlert({ type: 'error', text: reportStrings.reportFailed })
    }
  }

  return (
    <div className="flex flex-col gap-2 h-65 justify-between">
      <div className="flex flex-col gap-2">
        <div className=" *:mx-0 *:w-full">
          <Select
            instanceId="report-reason-select"
            aria-label={reportStrings.selectReportReason}
            options={reasonMenu}
            value={{ value: reason, label: reason }}
            onChange={e => setReason(e.value)}
          />
        </div>
        <TextBox
          value={explanation}
          onChange={e => {
            setExplanation(e.target.value)
            if (explanationError) setExplanationError('')
          }}
          placeholder={reportStrings.describeIssue}
          aria-label={reportStrings.reportDesc}
          error={explanationError}
          multiline={true}
        />
      </div>
      <div className="flex justify-center place-content-end">
        <GenericButton onClick={handleSubmit}>
          {reportStrings.submit}
        </GenericButton>
      </div>
    </div>
  )
}

Report.propTypes = {
  type: PropTypes.string.isRequired,
  targetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onClose: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
}
