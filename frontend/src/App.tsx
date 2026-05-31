import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './ui/layouts/MainLayout'
import TermsPage from './ui/pages/TermsPage'
import './index.css'

/**
 * Para agregar una nueva pantalla:
 *   1. Crear el componente en ui/pages/NuevaPagina.tsx
 *   2. Importarlo aquí y agregar un <Route> dentro del MainLayout
 *   3. Agregar el item de navegación en ui/components/Sidebar.tsx
 */

function PlaceholderPage ({ title }: { title: string }) {
  return (
    <div className="px-10 py-9">
      <h1 className="text-[28px] font-extrabold tracking-tight text-text-primary">{title}</h1>
      <p className="text-text-secondary mt-2 text-sm">
        Esta sección estará disponible próximamente.
      </p>
    </div>
  )
}

function App () {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/terms" replace />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/materias" element={<PlaceholderPage title="Materias" />} />
          <Route path="/profesores" element={<PlaceholderPage title="Profesores" />} />
          <Route path="/laboratorios" element={<PlaceholderPage title="Laboratorios" />} />
          <Route path="/generar-horario" element={<PlaceholderPage title="Generar Horario" />} />
          <Route path="/peligros" element={<PlaceholderPage title="Peligros" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
