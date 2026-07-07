import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './ui/components/Layout'
import AlarmCenter from './ui/pages/AlarmCenter'
import TermsPage from './ui/pages/TermsPage'
import HorariosPage from './ui/pages/HorariosPage'
import { MateriasPage } from './ui/pages/MateriasPage'
import LaboratoriosPage from './ui/pages/LaboratoriosPage'
import LoginPage from './ui/pages/LoginPage'
import { useUser } from './ui/store/userStore'
import { ProfesoresPage } from './ui/pages/ProfesoresPage'
import { DisponibilidadProfesorPage } from './ui/pages/DisponibilidadProfesorPage'
import { UsuariosPage } from './ui/pages/UsuariosPage'

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
        <Route path="/profesores" element={<ProfesoresPage />} />
        <Route path="/profesores/:cedula/disponibilidad" element={<DisponibilidadProfesorPage />} />
        <Route
          path="/usuarios"
          element={currentUser?.rol === 'administrador' ? <UsuariosPage /> : <Navigate to="/terms" replace />}
        />
      </Route>

      {/* Fallback general */}
      <Route path="*" element={<Navigate to="/terms" replace />} />
    </Routes>
  )
}

export default App
