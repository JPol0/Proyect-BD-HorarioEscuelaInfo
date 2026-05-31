import { useState, type FormEvent } from 'react'
import type { CreateTermInput } from '../../core/domain/ports/TermRepository.port'

interface Props {
  onClose: () => void
  onSubmit: (input: CreateTermInput) => Promise<void>
}

export default function TermModal ({ onClose, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [materias, setMaterias] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onSubmit({ name, startDate, endDate, materias })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el term')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      id="term-modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center z-50"
      style={{ animation: 'fadeIn 0.15s ease' }}
    >
      <div
        id="term-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="term-modal-title"
        className="bg-surface rounded-2xl p-7 w-full max-w-[460px] shadow-2xl"
        style={{ animation: 'slideUp 0.2s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="term-modal-title" className="text-lg font-bold text-text-primary">
            Nuevo Term Académico
          </h2>
          <button
            id="term-modal-close"
            onClick={onClose}
            className="bg-surface-alt border border-border rounded-lg w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-border transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form id="term-modal-form" onSubmit={(e) => { void handleSubmit(e) }}>
          <div className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label htmlFor="term-name" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Nombre del Term
              </label>
              <input
                id="term-name"
                type="text"
                required
                placeholder="ej. Primer Semestre 2027"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text-primary bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="term-start" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Fecha Inicio
                </label>
                <input
                  id="term-start"
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text-primary bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
              <div>
                <label htmlFor="term-end" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Fecha Fin
                </label>
                <input
                  id="term-end"
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text-primary bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
            </div>

            {/* Materias */}
            <div>
              <label htmlFor="term-materias" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Número de Materias
              </label>
              <input
                id="term-materias"
                type="number"
                min={0}
                required
                placeholder="0"
                value={materias === 0 ? '' : materias}
                onChange={e => setMaterias(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text-primary bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            {/* Error */}
            {error != null && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2.5 mt-2">
              <button
                id="term-modal-cancel"
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="term-modal-submit"
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary rounded-lg text-sm font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Guardando…' : '+ Crear Term'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
