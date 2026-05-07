import { PropTypes } from 'prop-types'
import { useState } from 'react'
import TextBox from './TextBox'
import GenericButton from './GenericButton'
import { ArrowBackIosNew } from '@mui/icons-material'
import { profileFormStrings } from '../locales/en/ComponentStrings/ProfileFormStrings'
import ProfilePicture from './ProfilePicture'

/**
 * A form component for creating or editing a user profile.
 *
 * @param {Object} [user] - The existing user data to populate the form fields.
 * @param {boolean} [isNew] - Flag to toggle between "Create" and "Edit" modes.
 * @param {Function} onSubmit - Callback function triggered when the form is successfully submitted.
 * @param {Function} [onCancel] - Optional callback triggered when the user exits without saving.
 * @returns {JSX.Element}
 */

const ProfileForm = ({ user, isNew, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    nickname: user?.nickname || '',
    description: user?.description || '',
    imageUrl: user?.profile_pic || '',
  })

  const [nicknameError, setNicknameError] = useState('')

  const handleBack = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      nickname: user?.nickname || '',
      description: user?.description || '',
      imageUrl: user?.profile_pic || '',
      file: null,
    })
    onCancel()
  }

  const handleFileInput = () => {
    const fileInput = document.getElementById('avatar-upload')
    if (fileInput) {
      fileInput.value = ''
      fileInput.click()
    }
  }

  const handleImageUpload = e => {
    const file = e.target.files[0]
    if (!file) return

    setFormData(prev => ({
      ...prev,
      file: file,
      imageUrl: URL.createObjectURL(file),
    }))
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
      <input
        id="avatar-upload"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
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
        <div className="relative h-24 w-24 m-auto">
          <ProfilePicture
            onImageClick={handleFileInput}
            avatarUrl={formData.imageUrl}
          ></ProfilePicture>
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
