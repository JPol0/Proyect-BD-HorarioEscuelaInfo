import { useState, type SVGProps, type ComponentType } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useActiveTerm } from '../store/activeTermStore'
import { useUser } from '../store/userStore'
import { HttpUserRepository } from '../../core/infrastructure/adapters/HttpUserRepository'
import { LogoutUser } from '../../core/application/useCases/User/LogoutUser'
import {
  Book,
  GraduationCap,
  Flask,
  Calendar,
  TriangleExclamation,
  LayoutHeaderSideContent,
  Persons,
  Bars,
  Xmark
} from '@gravity-ui/icons'

type Pantalla = 'peligros' | 'terms' | 'materias' | 'profesores' | 'laboratorios' | 'horarios' | 'usuarios'

interface NavItemBase {
  id: Pantalla
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

interface NavItemDisabled extends NavItemBase {
  disponible: false
}

interface NavItemEnabled extends NavItemBase {
  disponible: true
  path: string
}

type NavItem = NavItemDisabled | NavItemEnabled

const NAV_ITEMS: NavItem[] = [
  { id: 'materias', label: 'Materias', Icon: Book, disponible: true, path: '/materias' },
  { id: 'profesores', label: 'Profesores', Icon: GraduationCap, disponible: true, path: '/profesores' },
  { id: 'laboratorios', label: 'Laboratorios', Icon: Flask, disponible: true, path: '/laboratorios' },
  { id: 'horarios', label: 'Horario', Icon: Calendar, disponible: true, path: '/horarios' },
  { id: 'peligros', label: 'Alertas', Icon: TriangleExclamation, disponible: true, path: '/peligros' },
  { id: 'usuarios', label: 'Usuarios', Icon: Persons, disponible: true, path: '/usuarios' },
  { id: 'terms', label: 'Seleccionar Term', Icon: LayoutHeaderSideContent, disponible: true, path: '/terms' }
]

export default function Layout () {
  const { activeTerm } = useActiveTerm()
  const { currentUser, clearCurrentUser } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async (): Promise<void> => {
    try {
      const httpRepo = new HttpUserRepository()
      const useCase = new LogoutUser(httpRepo)
      await useCase.execute()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cerrar sesión:', err)
    } finally {
      clearCurrentUser()
    }
  }

  const navFiltered = NAV_ITEMS
    .filter(item => !(item.id === 'peligros' && currentUser?.rol === 'lector'))
    .filter(item => !(item.id === 'usuarios' && currentUser?.rol !== 'administrador'))

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-bgmain">
      {/* Header móvil para pantallas pequeñas (< lg) */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-sidebar text-white shrink-0 border-b border-slate-800 z-30">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold tracking-wide text-white">SGBD HORARIOS</h2>
          {activeTerm !== null
            ? (
              <span className="text-xs text-[#57a8c8] font-hanken font-bold truncate max-w-[200px]" title={activeTerm.name}>
                {'Term: ' + activeTerm.name}
              </span>
              )
            : (
              <span className="text-xs text-slate-400 font-hanken italic">
                Sin Term activo
              </span>
              )}
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMobileMenuOpen ? <Xmark className="h-6 w-6" /> : <Bars className="h-6 w-6" />}
        </button>
      </header>

      {/* Overlay backdrop del Drawer en móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Drawer en móvil, Fijo en escritorio lg) */}
      <aside
        className={[
          'bg-sidebar text-white flex flex-col shrink-0 select-none overflow-hidden transition-transform duration-300 ease-in-out z-50',
          'fixed inset-y-0 left-0 w-72 lg:static lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ].join(' ')}
      >
        <div className="px-6 pt-8 pb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-wide text-white">SGBD HORARIOS</h2>
            <p className="text-xs text-slate-400 mt-2 font-hanken">Universidad Católica Andrés Bello</p>
            {activeTerm !== null
              ? (
                <p className="text-sm text-[#57a8c8] font-hanken font-bold mt-3.5 truncate tracking-wide" title={activeTerm.name}>
                  {'Term: ' + activeTerm.name}
                </p>
                )
              : (
                <p className="text-sm text-slate-500 font-hanken italic mt-3.5">
                  Ningún term activo
                </p>
                )}
          </div>
          {/* Botón para cerrar drawer dentro del sidebar en móvil */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            aria-label="Cerrar menú lateral"
          >
            <Xmark className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 px-3 flex-1 overflow-y-auto">
          {navFiltered.map((item) => {
            const Icon = item.Icon
            if (!item.disponible) {
              return (
                <button
                  key={item.id}
                  disabled
                  className="flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-hanken text-left w-full text-slate-500 cursor-not-allowed transition-colors min-h-[44px]"
                  title="Próximamente"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            }

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-hanken text-left w-full transition-colors min-h-[44px]',
                    isActive
                      ? 'bg-button-primary text-white font-semibold shadow-md'
                      : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Sección de Usuario en la parte inferior */}
        <div className="mt-auto px-6 py-6 border-t border-slate-800 flex flex-col gap-3 bg-sidebar shrink-0">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200 truncate" title={currentUser?.nombre}>
              {currentUser?.nombre}
            </span>
            <span className="text-xs text-[#57a8c8] font-semibold uppercase tracking-wider mt-0.5">
              {currentUser?.rol}
            </span>
          </div>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false)
              void handleLogout()
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 hover:border-slate-600 min-h-[44px]"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto bg-bgmain">
        <Outlet />
      </main>
    </div>
  )
}
