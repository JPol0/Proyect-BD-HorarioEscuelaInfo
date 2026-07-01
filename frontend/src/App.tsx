import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './ui/components/Layout'
import AlarmCenter from './ui/pages/AlarmCenter'
import TermsPage from './ui/pages/TermsPage'
import HorariosPage from './ui/pages/HorariosPage'
import { MateriasPage } from './ui/pages/MateriasPage'
import LaboratoriosPage from './ui/pages/LaboratoriosPage'

function App () {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/terms" replace />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/horarios" element={<HorariosPage />} />
        <Route path="/peligros" element={<AlarmCenter />} />
        <Route path="/materias" element={<MateriasPage />} />
        <Route path="/laboratorios" element={<LaboratoriosPage />} />
      </Route>
    </Routes>
  )
}

export default App
