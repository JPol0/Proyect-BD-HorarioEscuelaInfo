import type { JSX } from 'react'
import type { DiaSemana, DisponibilidadHoraria } from '../../../core/domain/DisponibilidadHoraria'

interface DisponibilidadCellProps {
  celda: DisponibilidadHoraria
  onClick: (dia: DiaSemana, numeroModulo: number) => void
}

const ESTILO_POR_NIVEL: Record<number, string> = {
  0: 'bg-white text-slate-400',
  1: 'bg-emerald-100 text-emerald-800 font-medium',
  2: 'bg-amber-100 text-amber-800 font-medium'
}

export function DisponibilidadCell ({ celda, onClick }: DisponibilidadCellProps): JSX.Element {
  if (celda.ocupado) {
    return (
      <td className="border border-slate-200 bg-slate-100 px-2 py-2 text-sm text-slate-600">
        {celda.materiaAsignada ?? '-'}
      </td>
    )
  }

  const contenido = celda.disponibilidad === 0 ? '-' : celda.disponibilidad === 1 ? 'Disponible' : 'Opcional'

  return (
    <td
      className={`cursor-pointer border border-slate-200 px-2 py-2 text-center text-sm transition ${ESTILO_POR_NIVEL[celda.disponibilidad]}`}
      onClick={() => { onClick(celda.dia, celda.numeroModulo) }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick(celda.dia, celda.numeroModulo)
        }
      }}
    >
      {contenido}
    </td>
  )
}
