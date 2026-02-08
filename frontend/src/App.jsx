import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NavigationBar from './components/NavigationBar'
import Home from './pages/Home'
import MyTrip from './pages/MyTrips'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Router>
      <div className="app-container h-screen">
        {/* pages */}
        <main className="content bg-background-off-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mytrip" element={<MyTrip />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <NavigationBar />
      </div>
    </Router>
  )
}

export default App
