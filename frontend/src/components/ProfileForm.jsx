import { PropTypes } from 'prop-types'
import { useState } from 'react'
import TextBox from './TextBox'
import GenericButton from './GenericButton'
import BadgesBlock from './BadgesBlock'
import VehicleForm from './VehicleForm'
import VehicleBlock from './VehicleBlock'
import { Person, ArrowBackIosNew } from '@mui/icons-material'

const ProfileForm = ({
  user,
  isNew,
  //onSubmit
}) => {
  // Mock data
  // const existingUser = {
  //   id: 1,
  //   email: 'jamie@test.com',
  //   name: 'Jamie Kim',
  //   nickname: 'justJam',
  //   vehicle: true,
  //   description: "I am me.",
  //   profile_pic: null,
  //   isNew: false,
  // };

  // const newUser = {
  //   id: 1,
  //   email: 'newUser@test.com',
  //   name: 'New User',
  //   isNew: true
  // }

  // // user = newUser;
  // user = existingUser;
  // isNew = user.isNew;

  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    nickname: user?.nickname || '',
    description: user?.description || '',
    vehicle: user?.vehicle || false,
  })

  const [nicknameError, setNicknameError] = useState('')

  const handleBack = () => {
    console.log('Go back to previous page')
  }

  const handleChangePhoto = () => {
    console.log('Change photo')
  }

  const handleChange = e => {
    const { name, value } = e.target
    if (name !== 'name' && name !== 'email') {
      console.log(`Input Update: ${name} = "${value}"`)
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleVehicleAdd = vehicleDetails => {
    console.log('Add vehicle', vehicleDetails)
    setShowVehicleForm(false)
  }

  const toggleVehicleForm = () => {
    const newState = !showVehicleForm
    console.log(`Vehicle Form is now ${newState ? 'Visible' : 'Hidden'}`)
    setShowVehicleForm(newState)
  }

  const checkNickname = nickname => {
    const taken = ['justJam', 'dartFrog']
    if (taken.includes(nickname)) {
      setNicknameError('Nickname is already taken.')
    } else {
      setNicknameError('')
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    console.log('Data to be submitted:', formData)
  }

  return (
    <div className="relative max-w-md mx-auto bg-background-off-white min-h-screen mb-20">
      {/* Header */}
      <div className="bg-background-off-white relative flex items-center w-full p-4 border-b border-gray-100 h-16">
        <div className="absolute left-4 z-10">
          <GenericButton onClick={handleBack} unstyled>
            <ArrowBackIosNew className="text-gray-700" />
          </GenericButton>
        </div>
        <h1 className="w-full text-center text-lg font-bold text-gray-800">
          Profile
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
            <Person className="text-gray-300" style={{ fontSize: 60 }} />
          </div>
          <button
            type="button"
            onClick={handleChangePhoto}
            className="bg-blue-primary text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-600 active:scale-95 transition-all shadow-md"
          >
            Change Photo
          </button>
        </div>

        {/* Info Section (Read Only) */}
        <div className="space-y-3 opacity-80">
          <TextBox label="Full Name" value={formData.name} disabled />
          <TextBox label="Email Address" value={formData.email} disabled />
        </div>

        {/* Editable Section */}
        <div className="space-y-6">
          <h3 className="text-gray-800 font-bold text-xl">
            {isNew ? 'Create Your Profile' : 'Edit Your Profile'}
          </h3>

          <TextBox
            label="Nickname"
            name="nickname"
            placeholder="e.g. SpeedRacer"
            error={nicknameError}
            value={formData.nickname}
            onBlur={e => checkNickname(e.target.value)}
            onChange={handleChange}
          />

          <TextBox
            label="About Me"
            name="description"
            placeholder="Tell us a little bit about yourself..."
            value={formData.description}
            onChange={handleChange}
          />

          {/* Vehicle List Section */}
          <div className="space-y-4">
            {user?.vehicle && <VehicleBlock userId={user.id} />}

            <div className="flex justify-center">
              {showVehicleForm ? (
                <VehicleForm
                  onSubmit={handleVehicleAdd}
                  onCancel={toggleVehicleForm}
                />
              ) : (
                <GenericButton
                  type="button"
                  onClick={toggleVehicleForm}
                  unstyled={true}
                  customStyling="shadow-sm py-2 px-6 bg-blue-primary text-white font-bold rounded-full hover:bg-blue-500 active:scale-95 transition-all"
                >
                  {user?.vehicle ? '+ Add Another Vehicle' : '+ Add Vehicle'}
                </GenericButton>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            {!isNew && <BadgesBlock user={user} />}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-6">
          <GenericButton
            type="submit"
            disabled={!!nicknameError}
            unstyled={true}
            customStyling={`
              py-2 px-6 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95
              ${
                nicknameError
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-primary text-white hover:bg-blue-600 hover:shadow-blue-200'
              }
            `}
          >
            Save Changes
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
  //onSubmit: PropTypes.func.isRequired,
}
