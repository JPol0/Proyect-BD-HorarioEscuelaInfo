import type { JSX } from 'react'
import { FloppyDisk } from '@gravity-ui/icons'
import type { Profesor } from '../../../core/domain/Profesor'
import { useUser } from '../../store/userStore'

interface DisponibilidadHeaderProps {
  profesor: Profesor | null
  codTerm: string
  guardando: boolean
  onGuardar: () => void
}

export function DisponibilidadHeader ({ profesor, codTerm, guardando, onGuardar }: DisponibilidadHeaderProps): JSX.Element {
  const { currentUser } = useUser()
  const isLector = currentUser?.rol === 'lector'

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-subtitlePage">Profesores / Disponibilidad</p>
        <h1 className="text-3xl font-semibold text-titlePage">{profesor?.nombre ?? 'Profesor'}</h1>
        <p className="mt-1 text-sm text-subtitlePage">Carga de Disponibilidad Horaria - Semestre {codTerm}</p>
      </div>
      {!isLector && (
        <button
          type="button"
          onClick={onGuardar}
          disabled={guardando}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-button-primary px-4 py-2 font-medium text-white transition hover:bg-button-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          <FloppyDisk className="w-4 h-4 shrink-0" />
          {guardando ? 'Guardando...' : 'Guardar Disponibilidad'}
        </button>
      )}
    </div>
  )
}
