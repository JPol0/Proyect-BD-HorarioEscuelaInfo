import { NavLink, Outlet } from 'react-router-dom'
import { useActiveTerm } from '../store/activeTermStore'
import { useUser } from '../store/userStore'
import {
  Book,
  GraduationCap,
  Flask,
  Calendar,
  TriangleExclamation,
  LayoutHeaderSideContent
} from '@gravity-ui/icons'
import type { SVGProps, ComponentType } from 'react'

type Pantalla = 'peligros' | 'terms' | 'materias' | 'profesores' | 'laboratorios' | 'horarios'

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
  { id: 'profesores', label: 'Profesores', Icon: GraduationCap, disponible: false },
  { id: 'laboratorios', label: 'Laboratorios', Icon: Flask, disponible: true, path: '/laboratorios' },
  { id: 'horarios', label: 'Generar Horario', Icon: Calendar, disponible: true, path: '/horarios' },
  { id: 'peligros', label: 'Peligros', Icon: TriangleExclamation, disponible: true, path: '/peligros' },
  { id: 'terms', label: 'Seleccionar Term', Icon: LayoutHeaderSideContent, disponible: true, path: '/terms' }
]

export default function Layout () {
  const { activeTerm } = useActiveTerm()
  const { currentUser, clearCurrentUser } = useUser()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bgmain">
      <aside className="w-72 bg-sidebar text-white flex flex-col shrink-0 select-none overflow-hidden">
        <div className="px-6 pt-8 pb-6">
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

        <nav className="flex flex-col gap-1.5 px-3 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.Icon
            if (!item.disponible) {
              return (
                <button
                  key={item.id}
                  disabled
                  className="flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-hanken text-left w-full text-slate-500 cursor-not-allowed transition-colors"
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
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-hanken text-left w-full transition-colors',
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
            onClick={() => { clearCurrentUser() }}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto bg-bgmain">
        <Outlet />
      </main>
    </div>
  )
}
