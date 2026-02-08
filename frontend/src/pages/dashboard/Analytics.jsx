import { useState } from 'react'

function Analytics() {
  const [role, setRole] = useState('student') // "student" || "admin" || possibly "moderator"

  return (
    <>
      <h1>This is the Analytics Page</h1>
      <p>
        Current Role: <strong>{role}</strong>
      </p>
      <button type="button" onClick={() => setRole('student')}>
        View as Student
      </button>{' '}
      <button type="button" onClick={() => setRole('admin')}>
        View as Admin
      </button>
      <hr />
      {role === 'admin' ? <AdminAnalytics /> : <StudentAnalytics />}
    </>
  )
}

function AdminAnalytics() {
  return (
    <div>
      <h3>Admin Overview (All Users)</h3>
      <p>Placeholder admin analytics.</p>
    </div>
  )
}

function StudentAnalytics() {
  return (
    <div>
      <h3>My Impact (Personal)</h3>
      <p>Placeholder student analytics.</p>
    </div>
  )
}

export default Analytics
