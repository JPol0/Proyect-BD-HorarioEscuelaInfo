import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './ui/components/Layout'
import AlarmCenter from './ui/pages/AlarmCenter'
import TermsPage from './ui/pages/TermsPage'
import WeeklySchedulePage from './ui/pages/WeeklySchedulePage'

function App () {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/terms" replace />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/horarios" element={<WeeklySchedulePage />} />
        <Route path="/peligros" element={<AlarmCenter />} />
      </Route>
    </Routes>
  )
}

export default App
