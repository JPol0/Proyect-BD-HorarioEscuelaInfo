import type { JSX } from 'react'
import type { Profesor } from '../../../core/domain/Profesor'

interface DisponibilidadHeaderProps {
  profesor: Profesor | null
  codTerm: string
  guardando: boolean
  onGuardar: () => void
}

export function DisponibilidadHeader ({ profesor, codTerm, guardando, onGuardar }: DisponibilidadHeaderProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Profesores / Disponibilidad</p>
        <h1 className="text-3xl font-semibold text-slate-900">{profesor?.nombre ?? 'Profesor'}</h1>
        <p className="mt-1 text-sm text-slate-600">Carga de Disponibilidad Horaria - Semestre {codTerm}</p>
      </div>
      <button
        type="button"
        onClick={onGuardar}
        disabled={guardando}
        className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="mr-2">💾</span>
        {guardando ? 'Guardando...' : 'Guardar Disponibilidad'}
      </button>
    </div>
  )
}
