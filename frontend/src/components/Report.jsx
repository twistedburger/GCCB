import GenericButton from './GenericButton'
import Select from 'react-select'
import { useState } from 'react'
import PropTypes from 'prop-types'

export default function Report({ type, targetId, onClose, setAlert }) {
  const reasonMenu = [
    'Spam or Misleading Information',
    'Inappropriate Content',
    'Dangerous Activity',
    'Discrimination',
    'Other',
  ].map(r => ({ value: r, label: r, textvalue: r }))

  const [reason, setReason] = useState(reasonMenu[0].value)
  const [explanation, setExplanation] = useState('')
  const [explanationError, setExplanationError] = useState('')

  const handleSubmit = async () => {
    if (!explanation.trim()) {
      setExplanationError('Please provide an explanation.')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, targetId, reason, explanation }),
      })

      if (response.ok) {
        onClose()
        setAlert({
          type: 'success',
          text: 'Report submitted successfully.',
          visible: true,
        })
        setTimeout(() => {
          setAlert(prev => (prev ? { ...prev, visible: false } : null))
        }, 2000)
      }
    } catch {
      setAlert({ type: 'error', text: 'Failed to send report.', visible: true })
    }
  }

  return (
    <div className="flex flex-col gap-2 h-80">
      <div className=" *:mx-0 *:w-full">
        <Select
          instanceId="report-reason-select"
          aria-label="Select a reason for reporting"
          options={reasonMenu}
          value={{ value: reason, label: reason }}
          onChange={e => setReason(e.value)}
        />
      </div>
      <textarea
        required
        value={explanation}
        onChange={e => setExplanation(e.target.value)}
        placeholder="Please describe the issue..."
        aria-label="Description of the report"
        className="w-full rounded-xl border-2 border-medium-grey p-3 text-sm text-text-primary resize-none h-32 focus:outline-none focus:border-blue-primary"
      />
      {explanationError && (
        <p className="text-red-500 text-xs -mt-1.5">{explanationError}</p>
      )}
      <div className="flex justify-center">
        <GenericButton onClick={handleSubmit}>Submit</GenericButton>
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
