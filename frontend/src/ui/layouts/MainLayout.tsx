import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

/**
 * MainLayout — Layout principal de la aplicación.
 * 
 * Envuelve todas las páginas con el Sidebar y el área de contenido.
 * Para agregar una nueva pantalla, solo necesitas:
 *   1. Crear el componente en ui/pages/
 *   2. Agregar la ruta en App.tsx dentro del <Route element={<MainLayout />}>
 *   3. Agregar el item de navegación en Sidebar.tsx
 */
export default function MainLayout () {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
