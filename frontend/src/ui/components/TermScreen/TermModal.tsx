import { useState } from 'react'
import { type CreateTermInput } from '../../../core/application/ports/TermRepository'

interface TermModalProps {
  onClose: () => void
  onCrear: (input: CreateTermInput) => Promise<void>
}

export default function TermModal ({ onClose, onCrear }: TermModalProps) {
  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanedId = id.trim()
    if (!/^\d{4}-\d{2}$/.test(cleanedId)) {
      setError('El código del período debe tener el formato YYYY-XX (Ej. 2026-25)')
      return
    }
    if (nombre.trim() === '') {
      setError('La descripción del semestre es requerida')
      return
    }
    if (!startDate || !endDate) {
      setError('Las fechas de inicio y fin son requeridas')
      return
    }
    if (startDate >= endDate) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    try {
      setCargando(true)
      await onCrear({ id: cleanedId, descripcion: nombre.trim(), startDate, endDate })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-fade-in"
        onClick={(e) => { e.stopPropagation() }}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-titlePage font-hanken tracking-wide">
            Nuevo Term Académico
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors text-2xl leading-none p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center cursor-pointer"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
          {/* Código del Periodo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-hanken">
              Código del Term
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => { setId(e.target.value) }}
              placeholder="Ej. 2026-25"
              className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A5F7A] focus:border-transparent transition font-hanken"
            />
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-hanken">
              Descripción del Semestre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value) }}
              placeholder="Ej. Primer Semestre 2027"
              className="border border-slate-200 rounded-lg px-4 py-3 sm:py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A5F7A] focus:border-transparent transition font-hanken h-11 sm:h-auto"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-hanken">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value) }}
                className="border border-slate-200 rounded-lg px-3 py-3 sm:py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A5F7A] focus:border-transparent transition font-hanken h-11 sm:h-auto"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-hanken">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value) }}
                className="border border-slate-200 rounded-lg px-3 py-3 sm:py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A5F7A] focus:border-transparent transition font-hanken h-11 sm:h-auto"
              />
            </div>
          </div>

          {/* Error */}
          {error !== null && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 font-hanken">
              {error}
            </p>
          )}

          {/* Acciones */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 sm:py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-hanken min-h-[44px] sm:min-h-0 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="px-5 py-3 sm:py-2.5 text-sm font-medium text-white bg-button-primary hover:bg-button-primary-hover disabled:opacity-50 rounded-lg transition font-hanken flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0 cursor-pointer"
            >
              {cargando ? 'Creando...' : '+ Crear Term'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
