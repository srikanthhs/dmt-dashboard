import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Overview from './pages/Overview'
import Disability from './pages/Disability'
import Demographics from './pages/Demographics'
import Benefits from './pages/Benefits'
import Livelihood from './pages/Livelihood'
import Education from './pages/Education'
import Infrastructure from './pages/Infrastructure'
import Blocks from './pages/Blocks'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
        <Sidebar />
        <main style={{ flex: 1, overflowX: 'hidden', minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/disability" element={<Disability />} />
            <Route path="/demographics" element={<Demographics />} />
            <Route path="/benefits" element={<Benefits />} />
            <Route path="/livelihood" element={<Livelihood />} />
            <Route path="/education" element={<Education />} />
            <Route path="/infrastructure" element={<Infrastructure />} />
            <Route path="/blocks" element={<Blocks />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
