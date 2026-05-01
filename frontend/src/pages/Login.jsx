import SubmitButton from '../components/submitButton'
import AsyncSelect from 'react-select/async'
import { useState, useEffect } from 'react'
import { loginStrings } from '../locales/en/loginLocales'
import { getSSOProviders, redirect } from '../utils/LoginUtils'
import Alert from '../components/Alert'
import PropTypes from 'prop-types'

/**
 * Login Page
 *
 * @param {boolean} error - Indicates if there is an error to display (e.g., account suspended)
 *
 * @returns {JSX.Element}
 */
function Login({ error }) {
  const [selectedLogin, setSelectedLogin] = useState('')
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    if (error) {
      setAlert({
        message: loginStrings.suspended,
        type: 'error',
      })
    }
  }, [error])

  return (
    <div className="flex flex-col content-center mx-6 mt-36">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onTimeout={() => setAlert(null)}
        ></Alert>
      )}
      <h2 className="text-center">{loginStrings.welcome}</h2>
      <AsyncSelect
        className="m-2 font-medium text-black"
        loadOptions={getSSOProviders}
        defaultOptions
        onChange={option => {
          setSelectedLogin(option.value)
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
            setAlert({
              message: loginStrings.error,
              type: 'error',
            })
            return
          }
          redirect(
            `http://localhost:3000/loginRoute?connection=${selectedLogin}`
          )
        }}
      />
    </div>
  )
}

Login.propTypes = {
  error: PropTypes.bool,
}

export default Login
