import GenericButton from '../../components/GenericButton'

function Profile() {
  return (
    <>
      <h1>This is a profile page.</h1>
      <p>Stuff goes here.</p>
      <p>This button logs you out even though it says submit</p>
      <GenericButton
        onClick={() => {
          window.location.href = 'http://localhost:3000/logoutRoute'
        }}
        className="m-0"
      >
        Logout
      </GenericButton>
    </>
  )
}

export default Profile
