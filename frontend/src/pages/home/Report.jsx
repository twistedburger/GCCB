import GenericButton from '../../components/GenericButton'
import DropDownList from '../../components/DropDownList'
import { Cancel } from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Report() {
  const location = useLocation()
  const id = location.pathname.split('/').pop()
  console.log(id)
  const navigate = useNavigate()

  const [isClosing, setIsClosing] = useState(false)
  const [reason, setReason] = useState('')
  const [explanation, setExplanation] = useState('')
  const [explanationError, setExplanationError] = useState('')

  const closeWithAnimation = () => {
    setIsClosing(true)
    setTimeout(() => {
      navigate(-1)
    }, 300)
  }

  const handleSubmit = async () => {
    if (!explanation.trim()) {
      setExplanationError('Please provide an explanation.')
      return
    }
  }

  const handleCancel = () => {
    closeWithAnimation()
  }

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background-off-white ${isClosing ? 'sheet-exit' : 'sheet-enter'}`}
        style={{ maxHeight: '100dvh', overflowY: 'auto' }}
      >
        <div className="px-6 py-4 flex flex-col h-screen">
          <div className="flex flex-row justify-between text-text-primary">
            <span className="text-2xl font-medium">Report</span>
            <GenericButton
              onClick={handleCancel}
              unstyled={true}
              customStyling="text-text-primary scale-110 pb-4"
            >
              <Cancel />
            </GenericButton>
          </div>
          <div className="flex flex-col gap-2">
            <div className="-mx-2 *:min-w-86">
              <DropDownList
                items={[
                  'Spam or Misleading Information',
                  'Inappropriate Content',
                  'Dangerous Activity',
                  'Discrimination',
                  'Other',
                ]}
                onChange={setReason}
              />
            </div>
            <textarea
              required
              value={reason}
              onChange={e => setExplanation(e.target.value)}
              placeholder="Please describe the issue..."
              className="w-full rounded-xl border-2 border-medium-grey p-3 text-sm text-text-primary resize-none h-32 focus:outline-none focus:border-blue-primary"
            />
            {explanationError && (
              <p className="text-red-500 text-xs -mt-1.5">{explanationError}</p>
            )}
            <div className="flex justify-center">
              <GenericButton onClick={handleSubmit}>Submit</GenericButton>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
