import { useState } from 'react'
import AlarmCenter from './ui/pages/AlarmCenter'
import WeeklySchedulePage from './ui/pages/WeeklySchedulePage'

function App () {
  const [currentView, setCurrentView] = useState<'alarms' | 'schedule'>('schedule')

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0B132B] text-white p-6 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Encabezado del Sistema */}
          <div className="mb-8">
            <h2 className="text-xl font-bold tracking-wide text-white uppercase">SGBD Horarios</h2>
            <p className="text-xs text-slate-400 mt-1">Universidad Católica Andrés Bello</p>
            <p className="text-xs text-slate-400">Semestre 2026-15</p>
          </div>

          {/* Lista de navegación */}
          <nav className="space-y-1">
            <div className="px-3 py-2 text-sm text-slate-400 cursor-default flex items-center gap-2">
              <span>📓</span> Materias
            </div>
            <div className="px-3 py-2 text-sm text-slate-400 cursor-default flex items-center gap-2">
              <span>🎓</span> Profesores
            </div>
            <div className="px-3 py-2 text-sm text-slate-400 cursor-default flex items-center gap-2">
              <span>🔬</span> Laboratorios
            </div>
            <button
              onClick={() => setCurrentView('schedule')}
              className={`w-full text-left px-3 py-2 text-sm rounded font-medium transition-colors flex items-center gap-2 ${
                currentView === 'schedule' ? 'bg-[#1A5F7A] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>📅</span> Generar Horarios
            </button>
            <button
              onClick={() => setCurrentView('alarms')}
              className={`w-full text-left px-3 py-2 text-sm rounded font-medium transition-colors flex items-center gap-2 ${
                currentView === 'alarms' ? 'bg-[#1A5F7A] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>⚠️</span> Peligros
            </button>
            <div className="px-3 py-2 text-sm text-slate-400 cursor-default flex items-center gap-2">
              <span>🗓️</span> Seleccionar Term
            </div>
          </nav>
        </div>

        {/* Zona inferior */}
        <div className="pt-4 border-t border-slate-800 text-xs text-center text-slate-500 italic">
          [ Sistema de Gestión de Horarios ]
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 overflow-y-auto bg-white text-slate-900">
        {currentView === 'alarms' ? <AlarmCenter /> : <WeeklySchedulePage />}
      </main>
    </div>
  )
}

export default App
