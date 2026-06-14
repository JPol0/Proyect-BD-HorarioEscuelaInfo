import { useState } from 'react'
import AlarmCenter from './ui/pages/AlarmCenter'
import TermsPage from './ui/pages/TermsPage'
import WeeklySchedulePage from './ui/pages/WeeklySchedulePage'
import { DisponibilidadProfesorPage } from './ui/pages/DisponibilidadProfesorPage'
import heroImg from './assets/hero.png'

type Pantalla = 'peligros' | 'terms' | 'materias' | 'profesores' | 'laboratorios' | 'horarios'

interface NavItem {
  id: Pantalla
  label: string
  icon: string
  disponible: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: 'materias', label: 'Materias', icon: '📋', disponible: false },
  { id: 'profesores', label: 'Profesores', icon: '🎓', disponible: true },
  { id: 'laboratorios', label: 'Laboratorios', icon: '🔬', disponible: false },
  { id: 'horarios', label: 'Generar Horario', icon: '📅', disponible: true },
  { id: 'peligros', label: 'Peligros', icon: '⚠️', disponible: true },
  { id: 'terms', label: 'Seleccionar Term', icon: '🗓️', disponible: true }
]

function renderPagina (pantalla: Pantalla) {
  switch (pantalla) {
    case 'peligros':
      return <AlarmCenter />
    case 'terms':
      return <TermsPage />
    case 'horarios':
      return <WeeklySchedulePage />
    case 'profesores':
      return <DisponibilidadProfesorPage />
    default:
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-4xl mb-4">🚧</p>
          <p className="text-slate-500 font-hanken text-sm">Esta sección está en desarrollo.</p>
        </div>
      )
  }
}

function App () {
  const [pantallaActiva, setPantallaActiva] = useState<Pantalla>('terms')

  return (
    <div className="flex min-h-screen bg-bgmain">
      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className="w-56 bg-[#0B132B] text-white flex flex-col shrink-0 select-none overflow-hidden" style={{ minHeight: '100vh' }}>

        {/* Encabezado del Sistema */}
        <div className="px-5 pt-6 pb-5">
          <h2 className="text-base font-bold tracking-wide font-hanken">SGBD HORARIOS</h2>
          <p className="text-[11px] text-slate-400 mt-0.5 font-hanken">Universidad Católica Andrés Bello</p>
          <p className="text-[11px] text-slate-400 font-hanken">Semestre 2026-15</p>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {NAV_ITEMS.map((item) => {
            const esActiva = pantallaActiva === item.id

            return (
              <button
                key={item.id}
                onClick={() => { setPantallaActiva(item.id) }}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-hanken text-left w-full transition-colors',
                  esActiva
                    ? 'bg-[#1A5F7A] text-white font-semibold'
                    : item.disponible
                      ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                      : 'text-slate-500 cursor-not-allowed'
                ].join(' ')}
                disabled={!item.disponible}
                title={!item.disponible ? 'Próximamente' : undefined}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Imagen decorativa en la parte inferior del sidebar */}
        <div className="mt-auto">
          <img
            src={heroImg}
            alt="Campus universitario"
            className="w-full object-cover opacity-80"
            style={{ maxHeight: '160px' }}
          />
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ──────────────────────────────── */}
      <main className="flex-1 p-10 overflow-y-auto bg-bgmain">
        {renderPagina(pantallaActiva)}
      </main>
    </div>
  )
}

export default App
