import { PropTypes } from 'prop-types'
import ProfileForm from '../components/ProfileForm'

function CreateUser({ onUserCreated }) {
  // to be replaced with actual user data from parent
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  }

  const insertUser = async formData => {
    console.log(formData)
    const response = await fetch('http://localhost:3000/createNewUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include',
    })

    if (response.ok) {
      const responseJSON = await response.json()
      onUserCreated(responseJSON.user)
    }
  }

  return <ProfileForm user={mockUser} isNew={true} onSubmit={insertUser} />
}

export default CreateUser

CreateUser.propTypes = {
  onUserCreated: PropTypes.func.isRequired,
}
