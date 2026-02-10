import DropDownList from '../components/DropDownList'
import SubmitButton from '../components/submitButton'
import { useState } from 'react'

function Login() {
  const [selectedLogin, setSelectedLogin] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  return (
    <div className="flex flex-col content-center">
      <h2 className="my-16 text-center">Placeholder Text</h2>
      <DropDownList
        items={['None', 'BCIT', 'KdG', 'UBC', 'UVic']}
        onChange={e => {
          setSelectedLogin(e.target.value)
          setErrorMessage('')
        }}
      />{' '}
      {/* Get school list from DB? */}
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
          window.location.href =
            'http://localhost:3000/loginRoute?connection=google-oauth2'
        }}
      />
      <p className="my-16 text-center text-red-500">{errorMessage}</p>
    </div>
  )
}

export default Login
