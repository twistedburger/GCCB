import { useLocation, useNavigate } from 'react-router-dom'

function Activity() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role ?? 'student'
  const isAdmin = role === 'admin'

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>Activity</h1>
      <p>
        Viewing as: <strong>{role}</strong>
      </p>

      <hr />

      {isAdmin ? (
        <>
          <h3>Platform Activity</h3>
          <p>Placeholder:</p>
        </>
      ) : (
        <>
          <h3>My Activity</h3>
          <p>Placeholder:</p>
        </>
      )}
    </>
  )
}

export default Activity
