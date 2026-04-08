import { PropTypes } from 'prop-types'
import { useState } from 'react'
import TextBox from './TextBox'
import GenericButton from './GenericButton'
import { Person, ArrowBackIosNew } from '@mui/icons-material'
import { profileFormStrings } from '../locales/en/ComponentStrings/ProfileFormStrings'

const ProfileForm = ({ user, isNew, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    nickname: user?.nickname || '',
    description: user?.description || '',
  })

  const [nicknameError, setNicknameError] = useState('')

  const handleBack = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      nickname: user?.nickname || '',
      description: user?.description || '',
    })
    onCancel()
  }

  const handleChangePhoto = () => {
    console.log('Change photo')
  }

  const handleChange = e => {
    const { name, value } = e.target
    if (name !== 'name' && name !== 'email') {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const checkNickname = nickname => {
    const taken = ['justJam', 'dartFrog']
    if (taken.includes(nickname)) {
      setNicknameError(profileFormStrings.nicknameTaken)
    } else {
      setNicknameError('')
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="relative max-w-md mx-auto bg-background-off-white min-h-screen mb-20">
      {/* Header */}
      <div className="bg-background-off-white relative flex items-center w-full p-4 border-b border-gray-100 h-16">
        {!isNew && (
          <div className="absolute left-4 z-10">
            <GenericButton onClick={handleBack} unstyled>
              <ArrowBackIosNew className="text-gray-700" />
            </GenericButton>
          </div>
        )}
        <h1 className="w-full text-center text-lg font-bold text-gray-800">
          {isNew ? profileFormStrings.create : profileFormStrings.edit}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
            <Person className="text-gray-300" style={{ fontSize: 60 }} />
          </div>
          <GenericButton onClick={handleChangePhoto}>
            {profileFormStrings.changePhoto}
          </GenericButton>
        </div>

        {/* Info Section (Read Only) */}
        <div className="space-y-3 opacity-80">
          <TextBox
            label={profileFormStrings.fullName}
            value={formData.name}
            disabled
          />
          <TextBox
            label={profileFormStrings.email}
            value={formData.email}
            disabled
          />
        </div>

        {/* Editable Section */}
        <div className="space-y-6">
          <h3 className="text-gray-800 font-bold text-xl">
            {profileFormStrings.aboutMe}
          </h3>

          <TextBox
            label={profileFormStrings.nickname}
            name="nickname"
            placeholder={profileFormStrings.nicknamePlaceholder}
            error={nicknameError}
            value={formData.nickname}
            onBlur={e => checkNickname(e.target.value)}
            onChange={handleChange}
          />

          <TextBox
            label={profileFormStrings.description}
            name="description"
            placeholder={profileFormStrings.descriptionPlaceholder}
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Save */}
        <div className="flex justify-end pt-6">
          <GenericButton
            type="submit"
            onSubmit={handleSubmit}
            disabled={!!nicknameError}
            customStyling={`
              ${
                nicknameError
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : ''
              }
            `}
          >
            {profileFormStrings.saveChanges}
          </GenericButton>
        </div>
      </form>
    </div>
  )
}

export default ProfileForm

ProfileForm.propTypes = {
  user: PropTypes.object,
  isNew: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
}
