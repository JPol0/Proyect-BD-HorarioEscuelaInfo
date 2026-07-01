import { NavLink, Outlet } from 'react-router-dom'
import heroImg from '../../assets/hero.png'
import { useActiveTerm } from '../contexts/ActiveTermContext'

type Pantalla = 'peligros' | 'terms' | 'materias' | 'profesores' | 'laboratorios' | 'horarios'

interface NavItemBase {
  id: Pantalla
  label: string
  icon: string
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
  { id: 'profesores', label: 'Profesores', icon: '🎓', disponible: false },
  { id: 'laboratorios', label: 'Laboratorios', icon: '🔬', disponible: true, path: '/laboratorios' },
  { id: 'materias', label: 'Materias', icon: '📓', disponible: true, path: '/materias' },
  { id: 'horarios', label: 'Generar Horario', icon: '📅', disponible: true, path: '/horarios' },
  { id: 'peligros', label: 'Peligros', icon: '⚠️', disponible: true, path: '/peligros' },
  { id: 'terms', label: 'Seleccionar Term', icon: '🗓️', disponible: true, path: '/terms' }
]

export default function Layout () {
  const { activeTerm } = useActiveTerm()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bgmain">
      <aside className="w-56 bg-[#0B132B] text-white flex flex-col shrink-0 select-none overflow-hidden">
        <div className="px-5 pt-6 pb-5">
          <h2 className="text-base font-bold tracking-wide font-hanken">SGBD HORARIOS</h2>
          <p className="text-[11px] text-slate-400 mt-0.5 font-hanken">Universidad Católica Andrés Bello</p>
          {activeTerm !== null
            ? (
              <p className="text-[11px] text-[#57a8c8] font-hanken font-semibold truncate" title={activeTerm.name}>
                {activeTerm.name}
              </p>
              )
            : (
              <p className="text-[11px] text-slate-500 font-hanken italic">
                Ningún term activo
              </p>
              )}
        </div>

        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {NAV_ITEMS.map((item) => {
            if (!item.disponible) {
              return (
                <button
                  key={item.id}
                  disabled
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-hanken text-left w-full text-slate-500 cursor-not-allowed transition-colors"
                  title="Próximamente"
                >
                  <span className="text-base leading-none">{item.icon}</span>
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
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-hanken text-left w-full transition-colors',
                    isActive
                      ? 'bg-[#1A5F7A] text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  ].join(' ')
                }
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto">
          <img
            src={heroImg}
            alt="Campus universitario"
            className="w-full object-cover opacity-80"
            style={{ maxHeight: '160px' }}
          />
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto bg-bgmain">
        <Outlet />
      </main>
    </div>
  )
}
