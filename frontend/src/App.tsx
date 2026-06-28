import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './ui/components/Layout'
import AlarmCenter from './ui/pages/AlarmCenter'
import TermsPage from './ui/pages/TermsPage'
import WeeklySchedulePage from './ui/pages/WeeklySchedulePage'
import { DisponibilidadProfesorPage } from './ui/pages/DisponibilidadProfesorPage'
import { MateriasPage } from './ui/pages/MateriasPage'

function App () {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/terms" replace />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/horarios" element={<WeeklySchedulePage />} />
        <Route path="/peligros" element={<AlarmCenter />} />
        <Route path="/materias" element={<MateriasPage />} />
      </Route>
    </Routes>
  )
}

export default App
