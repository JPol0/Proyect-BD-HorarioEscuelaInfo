import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Developer {
  name: string
  initials: string
  gradient: string
}

const DEVELOPERS: Developer[] = [
  {
    name: 'Jean Paul Cova',
    initials: 'JC',
    gradient: 'from-blue-600 to-cyan-500'
  },
  {
    name: 'Jose Candurin',
    initials: 'JC',
    gradient: 'from-emerald-600 to-teal-500'
  },
  {
    name: 'Pedro Delgadillo',
    initials: 'PD',
    gradient: 'from-indigo-600 to-purple-500'
  },
  {
    name: 'Julio Solorzano',
    initials: 'JS',
    gradient: 'from-amber-600 to-orange-500'
  }
]

export default function DevelopersModal () {
  const [isOpen, setIsOpen] = useState(false)

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      {/* Botón disparador en el Sidebar */}
      <button
        onClick={() => { setIsOpen(true) }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-hanken text-left w-full text-slate-400 hover:bg-sidebar-hover hover:text-white transition-all cursor-pointer select-none group border border-transparent hover:border-slate-800"
      >
        <svg
          className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-sky-400 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        <span className="truncate">Desarrolladores</span>
      </button>

      {/* Modal vía React Portal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          {/* Backdrop para cerrar al hacer clic afuera */}
          <div
            className="absolute inset-0 cursor-default"
            onClick={() => { setIsOpen(false) }}
          />

          {/* Contenedor del Modal */}
          <div className="bg-[#0f1623] border border-slate-800 rounded-2xl p-6 sm:p-7 max-w-xl w-full shadow-2xl relative flex flex-col gap-6 z-10 mx-auto font-hanken max-h-[90vh] overflow-y-auto">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-950/40 rounded-xl border border-sky-800/50 shrink-0 text-sky-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Desarrolladores
                  </h3>
                  <p className="text-xs sm:text-sm font-normal text-slate-400">
                    Equipo del proyecto
                  </p>
                </div>
              </div>

              {/* Botón Cerrar */}
              <button
                onClick={() => { setIsOpen(false) }}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                aria-label="Cerrar modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Grid de Desarrolladores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEVELOPERS.map((dev) => (
                <div
                  key={dev.name}
                  className="bg-slate-900/60 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-4 sm:p-5 transition-all duration-200 flex items-center gap-4 group"
                >
                  {/* Avatar con iniciales */}
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-tr ${dev.gradient} flex items-center justify-center text-white font-extrabold text-sm tracking-wider shadow-md shrink-0 ring-2 ring-slate-800`}
                  >
                    {dev.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-[17px] font-semibold text-slate-100 tracking-tight leading-snug">
                      {dev.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                      Estudiante de Ingeniería Informática
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mención Académica e Institucional */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
              <div className="p-2.5 bg-slate-800/90 rounded-xl border border-slate-700/60 shrink-0 text-sky-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                Proyecto desarrollado para la cátedra de <span className="text-sky-300 font-medium">Base de Datos</span>. Universidad Católica Andrés Bello.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
