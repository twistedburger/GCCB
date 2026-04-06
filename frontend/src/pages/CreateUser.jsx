import { PropTypes } from 'prop-types'
import { insertUser } from '../utils/CreateUserUtils'
import ProfileForm from '../components/ProfileForm'

/**
 * Create user page as a version of profile form for a new user.
 *
 * @param {Object} ssoUser user returned from the auth0 authentication
 * @param {func} onUserCreated callback function once user has been created and added to the database successfully
 * @returns {JSX.Element}
 */
function CreateUser({ ssoUser, onUserCreated }) {
  return (
    <ProfileForm
      user={ssoUser}
      isNew={true}
      onSubmit={formData => insertUser(formData, onUserCreated)}
    />
  )
}

export default CreateUser

CreateUser.propTypes = {
  ssoUser: PropTypes.object,
  onUserCreated: PropTypes.func.isRequired,
}
