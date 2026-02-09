import { useLocation, useNavigate } from 'react-router-dom'

function Commutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role ?? 'student'
  const isAdmin = role === 'admin'

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>Commutes</h1>
      <p>
        Viewing as: <strong>{role}</strong>
      </p>

      <hr />

      {isAdmin ? (
        <>
          <h3>All Users</h3>
          <p>Placeholder:</p>
          <p>Placeholder:</p>
        </>
      ) : (
        <>
          <h3>My Commutes</h3>
          <p>Placeholder:</p>
        </>
      )}
    </>
  )
}

export default Commutes
