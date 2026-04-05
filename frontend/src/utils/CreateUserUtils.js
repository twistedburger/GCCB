/**
 * Tries to add a new user to the database.
 *
 * @param {Object} formData New user data
 * @param {func} onUserCreated callback function on user creation and insertion success
 */
export const insertUser = async (formData, onUserCreated) => {
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
