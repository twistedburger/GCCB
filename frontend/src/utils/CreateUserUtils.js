/**
 * Tries to add a new user to the database.
 *
 * @param {Object} formData New user data
 * @param {func} onUserCreated callback function on user creation and insertion success
 */
export const insertUser = async (formData, onUserCreated) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL
  const data = new FormData()

  data.append('name', formData.name)
  data.append('email', formData.email)
  data.append('nickname', formData.nickname)
  data.append('description', formData.description)

  if (formData.file) {
    data.append('file', formData.file)
  }

  const response = await fetch(`${baseURL}/createNewUser`, {
    method: 'POST',
    body: data,
    credentials: 'include',
  })

  if (response.ok) {
    const responseJSON = await response.json()
    onUserCreated(responseJSON.user)
  }
}
