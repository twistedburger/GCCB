import SubmitButton from '../../components/submitButton'

function Profile() {
  return (
    <>
      <h1>This is a profile page.</h1>
      <p>Stuff goes here.</p>
      <p>This button logs you out even though it says submit</p>
      <SubmitButton
        disabled={false}
        onClick={() => {
          {
            /* change to generic button later */
          }
          window.location.href = 'http://localhost:3000/logoutRoute'
        }}
      />
    </>
  )
}

export default Profile
