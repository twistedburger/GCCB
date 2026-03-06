// This page is now defunct

import { Link } from 'react-router-dom'

function Dashboard() {
  return (
    <>
      <h2>This is Dashboard page!</h2>
      <ul>
        <li>
          <Link to="/dashboard/analytics">Go to Analytics</Link>
        </li>
        <li>
          <Link to="/dashboard/profile">Go to My Account</Link>
        </li>
        <li>
          <Link to="/dashboard/settings">Go to Settings</Link>
        </li>
      </ul>
    </>
  )
}

export default Dashboard
