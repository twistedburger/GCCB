/**
 * Tries to add a new user to the database.
 *
 * @param {Object} formData New user data
 * @param {func} onUserCreated callback function on user creation and insertion success
 */
export const insertUser = async (formData, onUserCreated) => {
  // need to transport data like this since images are binary data
  const data = new FormData()

  data.append('name', formData.name)
  data.append('email', formData.email)
  data.append('nickname', formData.nickname)
  data.append('description', formData.description)

  if (formData.file) {
    data.append('file', formData.file)
  }

  const response = await fetch('http://localhost:3000/createNewUser', {
    method: 'POST',
    body: data,
    credentials: 'include',
  })

  if (response.ok) {
    const responseJSON = await response.json()
    onUserCreated(responseJSON.user)
  }
}
