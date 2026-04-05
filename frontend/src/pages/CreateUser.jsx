import { PropTypes } from 'prop-types'
import ProfileForm from '../components/ProfileForm'

/**
 * Create user page as a version of profile form for a new user.
 *
 * @param {Object} ssoUser user returned from the auth0 authentication
 * @param {func} onUserCreated callback function once user has been created and added to the database successfully
 * @returns {JSX.Element}
 */
function CreateUser({ ssoUser, onUserCreated }) {
  const insertUser = async formData => {
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

  return <ProfileForm user={ssoUser} isNew={true} onSubmit={insertUser} />
}

export default CreateUser

CreateUser.propTypes = {
  ssoUser: PropTypes.object,
  onUserCreated: PropTypes.func.isRequired,
}
