import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import MyTrip from './pages/MyTrips.jsx'
import Dashboard from './pages/Dashboard.jsx'

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* nav bar */}
        <nav className="navbar">
          <Link to="/">Home</Link>
          <Link to="/mytrip">My Trip</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>

        {/* pages */}
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mytrip" element={<MyTrip />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
