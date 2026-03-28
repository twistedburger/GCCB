import GenericButton from './GenericButton'
import TextBox from './TextBox'
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
    <div className="flex flex-col gap-2 h-60">
      <div className=" *:mx-0 *:w-full">
        <Select
          instanceId="report-reason-select"
          aria-label="Select a reason for reporting"
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
        placeholder={'Please describe the issue...'}
        aria-label="Description of the report"
        error={explanationError}
        multiline={true}
      />
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
