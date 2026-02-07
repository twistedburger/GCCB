import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NavigationBar from './components/NavigationBar'
import Home from './pages/Home'
import MyTrip from './pages/MyTrips'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Router>
      <div className="app-container relative h-screen">
        {/* pages */}
        <main className="content bg-background-off-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mytrip" element={<MyTrip />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <NavigationBar className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-md" />
        </main>
      </div>
    </Router>
  )
}

export default App
