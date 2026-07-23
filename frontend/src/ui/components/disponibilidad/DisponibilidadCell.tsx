import type { JSX, KeyboardEvent } from 'react'
import type { DiaSemana, DisponibilidadHoraria } from '../../../core/domain/DisponibilidadHoraria'
import { useUser } from '../../store/userStore'

interface DisponibilidadCellProps {
  celda: DisponibilidadHoraria
  isSelected: boolean
  isVisibleInMobile: boolean
  onClick: (dia: DiaSemana, numeroModulo: number) => void
  onKeyDown: (event: KeyboardEvent<HTMLTableCellElement>, dia: DiaSemana, numeroModulo: number) => void
}

const ESTILO_POR_NIVEL: Record<number, string> = {
  0: 'bg-slate-100 text-slate-500 font-medium hover:bg-slate-200/80',
  1: 'bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-xs',
  2: 'bg-amber-400 text-amber-950 font-bold hover:bg-amber-500 shadow-xs'
}

export function DisponibilidadCell ({ celda, isSelected, isVisibleInMobile, onClick, onKeyDown }: DisponibilidadCellProps): JSX.Element {
  const { currentUser } = useUser()
  const isLector = currentUser?.rol === 'lector'

  const displayClass = isVisibleInMobile ? 'table-cell w-1/2 sm:w-[18%]' : 'hidden sm:table-cell sm:w-[18%]'

  if (celda.ocupado) {
    return (
      <td className={`${displayClass} border border-slate-200 bg-slate-200/70 p-2 sm:p-3 text-xs sm:text-sm text-slate-700 font-medium text-center h-12 sm:h-14`}>
        <div className="flex flex-col items-center justify-center h-full w-full">
          <span className="truncate max-w-[120px]" title={celda.materiaAsignada ?? 'Asignado'}>
            {celda.materiaAsignada ?? 'Ocupado'}
          </span>
        </div>
      </td>
    )
  }

  const seleccionado = isSelected && !isLector ? 'ring-2 ring-teal-600 ring-offset-1 z-20 relative' : 'z-0 relative'
  const cursorStyle = isLector ? 'cursor-default' : 'cursor-pointer'
  const hoverEffect = !isLector ? 'hover:scale-[1.04] active:scale-[0.96] hover:z-20 hover:shadow-md cursor-pointer' : ''

  return (
    <td
      id={`cell-${celda.dia}-${celda.numeroModulo}`}
      className={`${displayClass} ${cursorStyle} border border-slate-200 p-0 text-center text-xs sm:text-base transition select-none h-12 sm:h-14 ${seleccionado}`}
      onClick={() => { if (!isLector) onClick(celda.dia, celda.numeroModulo) }}
      onKeyDown={(event) => { if (!isLector) onKeyDown(event, celda.dia, celda.numeroModulo) }}
      role="gridcell"
      tabIndex={!isLector && isSelected ? 0 : -1}
      aria-selected={!isLector && isSelected}
    >
      <div className={`w-full h-full min-h-[48px] sm:min-h-[56px] flex items-center justify-center transform transition-all duration-150 ease-out ${hoverEffect} ${ESTILO_POR_NIVEL[celda.disponibilidad]}`}>
        <span>{celda.disponibilidad}</span>
      </div>
    </td>
  )
}
