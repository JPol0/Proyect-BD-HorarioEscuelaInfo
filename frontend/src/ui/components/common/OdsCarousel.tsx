import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Slide {
  badge: string
  title: string
  description: string
  icon: React.ReactNode
}

const SLIDES: Slide[] = [
  {
    badge: 'ODS 9 • Infraestructura',
    title: 'Uso Eficiente de Aulas',
    description: 'La distribución digital inteligente maximiza el aprovechamiento de las aulas y laboratorios en el campus, optimizando el espacio físico disponible y reduciendo la subutilización.',
    icon: (
      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    badge: 'ODS 9 • Innovación',
    title: 'Gestión Automatizada',
    description: 'Al reemplazar los procesos manuales por algoritmos de distribución en la base de datos, eliminamos tareas repetitivas e introducimos innovación tecnológica en la gestión académica diaria.',
    icon: (
      <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  {
    badge: 'ODS 9 • Resiliencia',
    title: 'Datos Resilientes',
    description: 'Nuestra arquitectura limpia y estructurada garantiza una base de datos robusta, asegurando la integridad, escalabilidad y disponibilidad continua de la información académica crítica.',
    icon: (
      <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    )
  },
  {
    badge: 'ODS 9 • Sostenibilidad',
    title: 'Campus Sostenible',
    description: 'La planificación y exportación puramente digital de horarios disminuye radicalmente la necesidad de impresiones físicas, apoyando activamente un campus libre de papel y más verde.',
    icon: (
      <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
]

export default function OdsCarousel () {
  const [activeIndex, setActiveIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const timerRef = useRef<number | null>(null)

  const startTimer = () => {
    if (!isOpen) return // Solo rotar si el modal está abierto
    stopTimer()
    timerRef.current = window.setInterval(() => {
      handleNext()
    }, 5000) // Cambia cada 5 segundos en el modal
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  useEffect(() => {
    startTimer()
    return () => stopTimer()
  }, [activeIndex, isOpen])

  const triggerAnimation = (newIndex: number) => {
    setAnimating(true)
    setTimeout(() => {
      setActiveIndex(newIndex)
      setAnimating(false)
    }, 200)
  }

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % SLIDES.length
    triggerAnimation(nextIndex)
  }

  const handleDotClick = (index: number) => {
    if (index !== activeIndex) {
      triggerAnimation(index)
    }
  }

  const activeSlide = SLIDES[activeIndex]

  return (
    <>
      {/* Trigger Button inside Sidebar */}
      <button
        onClick={() => { setIsOpen(true) }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-hanken text-left w-full text-slate-400 hover:bg-sidebar-hover hover:text-white transition-all cursor-pointer select-none group border border-transparent hover:border-slate-800"
      >
        <svg className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="truncate">ODS 9 • Innovación</span>
      </button>

      {/* Modal Dialog rendered via Portal at document.body level */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in">
          {/* Backdrop click to close */}
          <div className="absolute inset-0 cursor-default" onClick={() => { setIsOpen(false) }} />

          {/* Modal Container */}
          <div
            className="bg-[#0f1623] border border-slate-800 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative flex flex-col gap-5 sm:gap-6 z-10 mx-auto font-sans"
            onMouseEnter={stopTimer}
            onMouseLeave={startTimer}
          >
            {/* Modal Header: Icono + Badge a la izquierda, Botón Cerrar a la derecha */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 shrink-0">
                  {activeSlide.icon}
                </div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest font-hanken">
                  {activeSlide.badge}
                </span>
              </div>

              {/* Close Button */}
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

            {/* Slide Content */}
            <div className={`flex flex-col gap-2.5 transition-all duration-300 ${animating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-hanken tracking-wide">
                {activeSlide.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-300 font-hanken leading-relaxed">
                {activeSlide.description}
              </p>
            </div>

            {/* Dots Indicator */}
            <div className="flex gap-2.5 mt-1 justify-start">
              {SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { handleDotClick(index) }}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${index === activeIndex ? 'w-7 bg-[#57a8c8]' : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                    }`}
                  aria-label={`Ir al slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
