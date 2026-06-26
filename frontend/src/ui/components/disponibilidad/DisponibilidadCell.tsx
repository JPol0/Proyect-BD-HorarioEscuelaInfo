import type { JSX, KeyboardEvent } from 'react'
import type { DiaSemana, DisponibilidadHoraria } from '../../../core/domain/DisponibilidadHoraria'

interface DisponibilidadCellProps {
  celda: DisponibilidadHoraria
  isSelected: boolean
  onClick: (dia: DiaSemana, numeroModulo: number) => void
  onKeyDown: (event: KeyboardEvent<HTMLTableCellElement>, dia: DiaSemana, numeroModulo: number) => void
}

const ESTILO_POR_NIVEL: Record<number, string> = {
  0: 'bg-white text-slate-400',
  1: 'bg-emerald-200 text-emerald-900 font-bold',
  2: 'bg-amber-200 text-amber-900 font-bold'
}

export function DisponibilidadCell ({ celda, isSelected, onClick, onKeyDown }: DisponibilidadCellProps): JSX.Element {
  if (celda.ocupado) {
    return (
      <td className="border border-slate-200 bg-slate-100 px-2 py-2 text-sm text-slate-600">
        {celda.materiaAsignada ?? '-'}
      </td>
    )
  }

  const seleccionado = isSelected ? 'outline outline-2 outline-offset-[-2px] outline-teal-500' : ''

  return (
    <td
      id={`cell-${celda.dia}-${celda.numeroModulo}`}
      className={`cursor-pointer border border-slate-200 px-2 py-2 text-center text-sm font-mono transition select-none ${ESTILO_POR_NIVEL[celda.disponibilidad]} ${seleccionado}`}
      onClick={() => { onClick(celda.dia, celda.numeroModulo) }}
      onKeyDown={(event) => { onKeyDown(event, celda.dia, celda.numeroModulo) }}
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
      aria-selected={isSelected}
    >
      {celda.disponibilidad}
    </td>
  )
}
