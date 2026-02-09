import { useLocation, useNavigate } from 'react-router-dom'

function TripFrequency() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role ?? 'student'
  const isAdmin = role === 'admin'

  const kpis = isAdmin
    ? [
        { label: 'Avg routes / creator (30d)', value: '2.3' },
        { label: 'Median routes / creator (30d)', value: '1.0' },
        { label: 'Active creators (30d)', value: '41' },
        { label: 'Creators with 2+ routes (30d)', value: '18' },
      ]
    : [
        { label: 'My routes / week', value: '2-3' },
        { label: 'My avg routes / day (7d)', value: '1.8' },
        { label: 'My weekly streak', value: '3 weeks' },
        { label: 'My most active day', value: 'Tuesday' },
      ]

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>{isAdmin ? 'Trip Frequency (All Users)' : 'My Trip Frequency'}</h1>
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
          <strong>Mode:</strong> Walk / Cycle / Carpool / Transit
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
        {isAdmin ? (
          <>
            <li>
              <strong>Routes per creator distribution:</strong> histogram (0, 1,
              2-3, 4+)
            </li>
            <li>
              <strong>Active creators over time:</strong> line chart
            </li>
            <li>
              <strong>Routes per day/week:</strong> line or bar chart
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>My routes per week:</strong> bar chart
            </li>
            <li>
              <strong>My streak over time:</strong> line chart
            </li>
            <li>
              <strong>My busiest day/time:</strong> bar chart by weekday/hour
            </li>
          </>
        )}
      </ul>

      <hr />
    </>
  )
}

export default TripFrequency
