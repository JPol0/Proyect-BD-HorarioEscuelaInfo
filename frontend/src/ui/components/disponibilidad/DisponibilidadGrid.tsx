import { type JSX, type KeyboardEvent, useCallback, useRef, useState } from 'react'
import type { DiaSemana, DisponibilidadHoraria } from '../../../core/domain/DisponibilidadHoraria'
import { DIAS_SEMANA, MODULOS_HORARIO } from '../../../core/domain/DisponibilidadHoraria'
import { DisponibilidadCell } from './DisponibilidadCell'

interface DisponibilidadGridProps {
  grilla: DisponibilidadHoraria[]
  onCeldaClick: (dia: DiaSemana, numeroModulo: number) => void
}

interface CeldaSeleccionada {
  diaIndex: number
  moduloIndex: number
}

export function DisponibilidadGrid ({ grilla, onCeldaClick }: DisponibilidadGridProps): JSX.Element {
  const [seleccionada, setSeleccionada] = useState<CeldaSeleccionada | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  const focusCelda = useCallback((diaIndex: number, moduloIndex: number): void => {
    const dia = DIAS_SEMANA[diaIndex]
    const modulo = MODULOS_HORARIO[moduloIndex]
    if (dia == null || modulo == null) return
    const el = tableRef.current?.querySelector<HTMLElement>(
      `#cell-${dia}-${modulo.numeroModulo}`
    )
    el?.focus()
  }, [])

  const handleClick = useCallback((dia: DiaSemana, numeroModulo: number): void => {
    const diaIndex = DIAS_SEMANA.indexOf(dia)
    const moduloIndex = MODULOS_HORARIO.findIndex((m) => m.numeroModulo === numeroModulo)
    setSeleccionada({ diaIndex, moduloIndex })
    onCeldaClick(dia, numeroModulo)
  }, [onCeldaClick])

  const handleKeyDown = useCallback((
    event: KeyboardEvent<HTMLTableCellElement>,
    dia: DiaSemana,
    numeroModulo: number
  ): void => {
    const diaIndex = DIAS_SEMANA.indexOf(dia)
    const moduloIndex = MODULOS_HORARIO.findIndex((m) => m.numeroModulo === numeroModulo)

    let nextDia = diaIndex
    let nextModulo = moduloIndex

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        nextDia = Math.min(diaIndex + 1, DIAS_SEMANA.length - 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        nextDia = Math.max(diaIndex - 1, 0)
        break
      case 'ArrowDown':
        event.preventDefault()
        nextModulo = Math.min(moduloIndex + 1, MODULOS_HORARIO.length - 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        nextModulo = Math.max(moduloIndex - 1, 0)
        break
      case 'Tab': {
        event.preventDefault()
        if (event.shiftKey) {
          if (diaIndex > 0) {
            nextDia = diaIndex - 1
          } else if (moduloIndex > 0) {
            nextDia = DIAS_SEMANA.length - 1
            nextModulo = moduloIndex - 1
          }
        } else {
          if (diaIndex < DIAS_SEMANA.length - 1) {
            nextDia = diaIndex + 1
          } else if (moduloIndex < MODULOS_HORARIO.length - 1) {
            nextDia = 0
            nextModulo = moduloIndex + 1
          }
        }
        break
      }
      case 'Enter':
      case ' ':
        event.preventDefault()
        onCeldaClick(dia, numeroModulo)
        return
      default:
        return
    }

    setSeleccionada({ diaIndex: nextDia, moduloIndex: nextModulo })
    focusCelda(nextDia, nextModulo)
  }, [onCeldaClick, focusCelda])

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table ref={tableRef} className="min-w-full text-sm" role="grid">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="border border-slate-200 px-3 py-2 text-left">HORA</th>
            {DIAS_SEMANA.map((dia) => (
              <th key={dia} className="border border-slate-200 px-3 py-2 text-center">{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODULOS_HORARIO.map((modulo, moduloIndex) => (
            <tr key={modulo.numeroModulo}>
              <td className="border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-600">
                {modulo.horaInicio}
              </td>
              {DIAS_SEMANA.map((dia, diaIndex) => {
                const celda = grilla.find((item) => item.dia === dia && item.numeroModulo === modulo.numeroModulo)
                const estaSeleccionada =
                  seleccionada != null &&
                  seleccionada.diaIndex === diaIndex &&
                  seleccionada.moduloIndex === moduloIndex
                return celda != null ? (
                  <DisponibilidadCell
                    key={`${dia}-${modulo.numeroModulo}`}
                    celda={celda}
                    isSelected={estaSeleccionada}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                  />
                ) : null
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
