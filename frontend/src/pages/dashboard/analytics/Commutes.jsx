import { useLocation, useNavigate } from 'react-router-dom'

function Commutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role ?? 'student'
  const isAdmin = role === 'admin'

  // Placeholder values
  const kpis = isAdmin
    ? [
        { label: 'Routes scheduled (30d)', value: '4,567' },
        { label: 'Total distance (30d)', value: '12,340 km' },
        { label: 'Avg distance / route', value: '2.7 km' },
        { label: 'Completion rate (30d)', value: '74%' },
      ]
    : [
        { label: 'My routes (30d)', value: '12' },
        { label: 'My distance (30d)', value: '32.1 km' },
        { label: 'Avg distance / route', value: '2.7 km' },
        { label: 'My completion rate (30d)', value: '80%' },
      ]

  const modeBreakdown = [
    { mode: 'Walk', share: '22%' },
    { mode: 'Cycle', share: '31%' },
    { mode: 'Carpool', share: '20%' },
    { mode: 'Transit', share: '27%' },
  ]

  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>{isAdmin ? 'Commutes (All Users)' : 'My Commutes'}</h1>
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
          <strong>Routes over time:</strong> line or bar chart (daily/weekly)
        </li>
        <li>
          <strong>Distance over time:</strong> line chart (daily/weekly)
        </li>
        <li>
          <strong>Mode split:</strong> pie/stacked bar chart
        </li>
      </ul>

      <hr />

      <h3>Mode mix (placeholder table)</h3>
      <ul>
        {modeBreakdown.map(row => (
          <li key={row.mode}>
            <strong>{row.mode}:</strong> {row.share}
          </li>
        ))}
      </ul>

      <hr />
    </>
  )
}

export default Commutes
