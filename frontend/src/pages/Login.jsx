import SubmitButton from '../components/submitButton'
import AsyncSelect from 'react-select/async'
import { useState } from 'react'
import { loginStrings } from '../locales/en/loginLocales'
import { getSSOProviders, redirect } from '../utils/LoginUtils'

/**
 * Login Page
 *
 * @returns {JSX.Element}
 */
function Login() {
  const [selectedLogin, setSelectedLogin] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  return (
    <div className="flex flex-col content-center">
      <h2 className="my-16 text-center">{loginStrings.welcome}</h2>
      <AsyncSelect
        className="m-2 font-medium text-black"
        loadOptions={getSSOProviders}
        defaultOptions
        onChange={option => {
          setSelectedLogin(option.value)
          if (selectedLogin === 'None' || selectedLogin === '') {
            setErrorMessage('')
          }
        }}
        placeholder={loginStrings.searching}
      />
      <SubmitButton
        disabled={false}
        onClick={() => {
          {
            /* change to generic button later */
          }
          if (selectedLogin === 'None' || selectedLogin === '') {
            setErrorMessage(loginStrings.error)
            return
          }
          redirect(
            `http://localhost:3000/loginRoute?connection=${selectedLogin}`
          )
        }}
      />
      <p className="my-16 text-center text-red-500">{errorMessage}</p>
    </div>
  )
}

export default Login
