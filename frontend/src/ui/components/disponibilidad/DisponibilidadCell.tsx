import type { JSX, KeyboardEvent } from 'react'
import type { DiaSemana, DisponibilidadHoraria } from '../../../core/domain/DisponibilidadHoraria'
import { useUser } from '../../store/userStore'

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
  const { currentUser } = useUser()
  const isLector = currentUser?.rol === 'lector'

  if (celda.ocupado) {
    return (
      <td className="border border-slate-200 bg-slate-100 px-2 py-3 sm:py-2 text-xs sm:text-sm text-slate-600 text-center">
        {celda.materiaAsignada ?? '-'}
      </td>
    )
  }

  const seleccionado = isSelected && !isLector ? 'outline outline-2 outline-offset-[-2px] outline-teal-500' : ''
  const cursorStyle = isLector ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50'

  return (
    <td
      id={`cell-${celda.dia}-${celda.numeroModulo}`}
      className={`${cursorStyle} border border-slate-200 px-2 py-3 sm:py-2 text-center text-xs sm:text-sm font-mono transition select-none ${ESTILO_POR_NIVEL[celda.disponibilidad]} ${seleccionado}`}
      onClick={() => { if (!isLector) onClick(celda.dia, celda.numeroModulo) }}
      onKeyDown={(event) => { if (!isLector) onKeyDown(event, celda.dia, celda.numeroModulo) }}
      role="gridcell"
      tabIndex={!isLector && isSelected ? 0 : -1}
      aria-selected={!isLector && isSelected}
    >
      {celda.disponibilidad}
    </td>
  )
}
