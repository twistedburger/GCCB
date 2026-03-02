import SubmitButton from '../components/submitButton'
import AsyncSelect from 'react-select/async'
import { useState } from 'react'

function Login() {
  const [selectedLogin, setSelectedLogin] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function getSSOProviders(search) {
    const response = await fetch(
      `http://localhost:3000/sso_list?search=${search}`
    )
    if (!response.ok) {
      const errorText = await response.text()
      console.log(response.status + ' ' + errorText)
      return
    }
    const responseJSON = await response.json()
    if (responseJSON) {
      return responseJSON.map(school => ({
        value: school.sso_connection,
        label: school.school_name,
      }))
    }
    return []
  }

  return (
    <div className="flex flex-col content-center">
      <h2 className="my-16 text-center">Placeholder Text</h2>
      <AsyncSelect
        className="m-2 font-medium text-black"
        loadOptions={getSSOProviders}
        defaultOptions
        onChange={option => {
          setSelectedLogin(option.value)
        }}
        placeholder="Search for a school..."
      />
      <SubmitButton
        disabled={false}
        onClick={() => {
          {
            /* change to generic button later */
          }
          if (selectedLogin === 'None' || selectedLogin === '') {
            setErrorMessage('Placeholder error message')
            return
          }
          window.location.href = `http://localhost:3000/loginRoute?connection=${selectedLogin}`
        }}
      />
      <p className="my-16 text-center text-red-500">{errorMessage}</p>
    </div>
  )
}

export default Login
