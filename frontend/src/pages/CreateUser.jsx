import { useState, useEffect } from 'react'

function CreateUser() {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    insertUser()
  }, [])

  const insertUser = async () => {
    const response = await fetch('http://localhost:3000/createNewUser', {
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
      <h2>
        Currently this page sends a request to insert a generic form of the user
        into the DB, and displays the details. Reload the page to go to home
        page
      </h2>
      {currentUser && (
        <div>
          <p>Email: {currentUser.email}</p>
          <p>Name: {currentUser.name}</p>
          <p>Nickname: {currentUser.nickname}</p>
          <p>Role: {currentUser.role}</p>
        </div>
      )}
    </div>
  )
}

export default CreateUser
