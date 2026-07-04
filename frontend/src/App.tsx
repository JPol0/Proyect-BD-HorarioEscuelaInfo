import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './ui/components/Layout'
import AlarmCenter from './ui/pages/AlarmCenter'
import TermsPage from './ui/pages/TermsPage'
import HorariosPage from './ui/pages/HorariosPage'
import { MateriasPage } from './ui/pages/MateriasPage'
import LaboratoriosPage from './ui/pages/LaboratoriosPage'
import LoginPage from './ui/pages/LoginPage'
import { useUser } from './ui/store/userStore'

function App () {
  const { currentUser } = useUser()

  return (
    <Routes>
      {/* Ruta de Login: Si ya está autenticado, redirige a terms */}
      <Route
        path="/login"
        element={currentUser !== null ? <Navigate to="/terms" replace /> : <LoginPage />}
      />

      {/* Rutas protegidas: Si no está autenticado, redirige a login */}
      <Route element={currentUser === null ? <Navigate to="/login" replace /> : <Layout />}>
        <Route index element={<Navigate to="/terms" replace />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/horarios" element={<HorariosPage />} />
        <Route path="/peligros" element={<AlarmCenter />} />
        <Route path="/materias" element={<MateriasPage />} />
        <Route path="/laboratorios" element={<LaboratoriosPage />} />
      </Route>

      {/* Fallback general */}
      <Route path="*" element={<Navigate to="/terms" replace />} />
    </Routes>
  )
}

export default App
