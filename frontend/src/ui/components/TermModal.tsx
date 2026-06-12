import { useState } from 'react'
import { type CreateTermInput } from '../../core/application/ports/TermRepository'

interface TermModalProps {
  onClose: () => void
  onCrear: (input: CreateTermInput) => Promise<void>
}

export default function TermModal ({ onClose, onCrear }: TermModalProps) {
  const [nombre, setNombre] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (nombre.trim() === '') {
      setError('El nombre del término es requerido')
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
      await onCrear({ name: nombre.trim(), startDate, endDate })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in"
        onClick={(e) => { e.stopPropagation() }}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-titlePage font-hanken tracking-wide">
            Nuevo Term Académico
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-hanken">
              Nombre del Período
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value) }}
              placeholder="Ej. Primer Semestre 2027"
              className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A5F7A] focus:border-transparent transition font-hanken"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-hanken">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value) }}
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A5F7A] focus:border-transparent transition font-hanken"
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
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1A5F7A] focus:border-transparent transition font-hanken"
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
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-hanken"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#1A5F7A] hover:opacity-90 disabled:opacity-50 rounded-lg transition font-hanken flex items-center gap-2"
            >
              {cargando ? 'Creando...' : '+ Crear Term'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
