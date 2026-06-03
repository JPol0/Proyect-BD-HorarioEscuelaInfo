import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/materias', label: 'Materias', icon: '📋' },
  { to: '/profesores', label: 'Profesores', icon: '🎓' },
  { to: '/laboratorios', label: 'Laboratorios', icon: '🔬' },
  { to: '/generar-horario', label: 'Generar Horario', icon: '📅' },
  { to: '/peligros', label: 'Peligros', icon: '⚠️' },
  { to: '/terms', label: 'Seleccionar Term', icon: '🗂️' }
]

export default function Sidebar () {
  return (
    <aside className="w-[220px] min-w-[220px] bg-sidebar flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.07]">
        <div className="text-white font-bold text-[15px] tracking-wide">
          SGBD HORARIOS
        </div>
        <div className="text-white/45 text-[11px] mt-1 leading-snug">
          Universidad Católica Andres Bello
        </div>
        <span className="inline-block mt-2 bg-primary/25 text-[#7eb3ff] text-[10px] font-semibold px-2.5 py-0.5 rounded">
          Semestre 2026-15
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-[13px] no-underline transition-all duration-150 border-l-[3px] ${
                isActive
                  ? 'text-white bg-primary/20 border-l-primary font-semibold'
                  : 'text-white/55 border-l-transparent hover:text-white/80 hover:bg-white/[0.04]'
              }`
            }
          >
            <span className="text-sm">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
