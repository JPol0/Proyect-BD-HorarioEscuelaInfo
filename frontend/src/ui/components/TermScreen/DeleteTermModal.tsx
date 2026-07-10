import { useState } from 'react'
import { type Term } from '../../../core/domain/Term'
import { TrashBin, TriangleExclamationFill } from '@gravity-ui/icons'

interface DeleteTermModalProps {
  term: Term
  onClose: () => void
  onConfirm: (term: Term) => Promise<void>
}

export default function DeleteTermModal ({ term, onClose, onConfirm }: DeleteTermModalProps) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    try {
      setError(null)
      setCargando(true)
      await onConfirm(term)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el término académico')
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in border border-slate-100"
        onClick={(e) => { e.stopPropagation() }}
      >
        {/* Encabezado con Icono de Advertencia */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <TriangleExclamationFill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-hanken tracking-wide">
              Eliminar Term Académico
            </h2>
            <p className="text-xs text-slate-500 font-hanken">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-sm text-slate-700 font-hanken">
            ¿Estás seguro de que deseas eliminar el período académico{' '}
            <strong className="text-slate-900 font-bold">"{term.name}"</strong>?
          </p>
        </div>

        {/* Mensaje de error si la base de datos restringe o falla */}
        {error !== null && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-hanken flex items-start gap-2">
            <TriangleExclamationFill className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={cargando}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition font-hanken"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => { void handleConfirm() }}
            disabled={cargando}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition font-hanken flex items-center gap-2 shadow-sm"
          >
            {cargando ? 'Eliminando...' : (
              <>
                <TrashBin className="w-4 h-4" />
                Eliminar Term
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
