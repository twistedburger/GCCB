import { useLocation, useNavigate } from 'react-router-dom'

function Activity() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role ?? 'student'
  const isAdmin = role === 'admin'

  // Safeguard: Handle with auth or redirect
  if (!isAdmin) {
    return (
      <>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>

        <h1>Platform Activity</h1>
        <p>This should only be viewable by administrators.</p>
      </>
    )
  }

  const kpis = [
    { label: 'Active route creators (7d)', value: '25' },
    { label: 'Upcoming routes', value: '18' },
    { label: 'Completion rate (30d)', value: '74%' },
    { label: 'Rejected routes (30d)', value: '9' },
  ]

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>Activity (Platform)</h1>
      <p>
        Viewing as: <strong>{role}</strong>
      </p>

      <hr />

      <h3>Filters (placeholder)</h3>
      <ul>
        <li>
          <strong>Date range:</strong> Last 7 days / Last 30 days / All Time
        </li>
        <li>
          <strong>Status:</strong> Upcoming / Completed / Rejected
        </li>
      </ul>

      <hr />

      <h3>Key metrics</h3>
      <ul>
        {kpis.map(k => (
          <li key={k.label}>
            <strong>{k.label}:</strong> {k.value}
          </li>
        ))}
      </ul>

      <hr />

      <h3>Charts (placeholders)</h3>
      <ul>
        <li>
          <strong>Active creators over time:</strong> line chart (DAU/WAU)
        </li>
        <li>
          <strong>Upcoming vs completed routes:</strong> stacked bars by week
        </li>
        <li>
          <strong>Rejection reasons:</strong> bar chart (top reasons)
        </li>
      </ul>

      <hr />
    </>
  )
}

export default Activity
