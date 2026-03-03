import { useState } from 'react'
import ProfileForm from '../components/ProfileForm'

function CreateUser() {
  const [currentUser, setCurrentUser] = useState(null)

  const insertUser = async formData => {
    const response = await fetch('http://localhost:3000/createNewUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.log(response.status + ' ' + errorText)
      return
    }
    const responseJSON = await response.json()
    if (responseJSON) {
      setCurrentUser(responseJSON.user)
    }
  }

  return (
    <div>
      <ProfileForm user={currentUser} isNew={true} onSubmit={insertUser} />
    </div>
  )
}

export default CreateUser
