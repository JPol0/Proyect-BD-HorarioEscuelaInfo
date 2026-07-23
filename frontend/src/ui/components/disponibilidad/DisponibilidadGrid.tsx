import { type JSX, type KeyboardEvent, useCallback, useRef, useState } from 'react'
import type { DiaSemana, DisponibilidadHoraria, NivelDisponibilidad } from '../../../core/domain/DisponibilidadHoraria'
import { DIAS_SEMANA, MODULOS_HORARIO } from '../../../core/domain/DisponibilidadHoraria'
import { DisponibilidadCell } from './DisponibilidadCell'

interface DisponibilidadGridProps {
  grilla: DisponibilidadHoraria[]
  onCeldaClick: (dia: DiaSemana, numeroModulo: number) => void
  onCeldaValueChange: (dia: DiaSemana, numeroModulo: number, valor: NivelDisponibilidad) => void
}

interface CeldaSeleccionada {
  diaIndex: number
  moduloIndex: number
}

export function DisponibilidadGrid ({ grilla, onCeldaClick, onCeldaValueChange }: DisponibilidadGridProps): JSX.Element {
  const [seleccionada, setSeleccionada] = useState<CeldaSeleccionada | null>(null)
  const [activeMobileDia, setActiveMobileDia] = useState<DiaSemana>('Lunes')
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
      case '0':
        event.preventDefault()
        onCeldaValueChange(dia, numeroModulo, 0)
        return
      case '1':
        event.preventDefault()
        onCeldaValueChange(dia, numeroModulo, 1)
        return
      case '2':
        event.preventDefault()
        onCeldaValueChange(dia, numeroModulo, 2)
        return
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
  }, [onCeldaClick, onCeldaValueChange, focusCelda])

  return (
    <div className="space-y-4">
      {/* Pestañas de día para vista Móvil */}
      <div className="flex sm:hidden overflow-x-auto gap-1 border border-slate-200 rounded-xl p-1 bg-slate-100/80 shadow-xs">
        {DIAS_SEMANA.map((dia) => {
          const isActive = dia === activeMobileDia
          return (
            <button
              key={dia}
              type="button"
              onClick={() => setActiveMobileDia(dia)}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition cursor-pointer whitespace-nowrap text-center ${
                isActive
                  ? 'bg-button-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {dia}
            </button>
          )
        })}
      </div>

      {/* Leyenda e instrucciones */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-slate-100 border border-slate-300 inline-block shadow-2xs"></span>
            <span><strong className="font-mono">0</strong>: No disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-emerald-500 inline-block shadow-2xs"></span>
            <span><strong className="font-mono">1</strong>: Preferencia Principal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-amber-400 inline-block shadow-2xs"></span>
            <span><strong className="font-mono">2</strong>: Segunda Opción</span>
          </div>
        </div>
        <span className="text-slate-500 italic text-xs">Haz clic o usa las teclas (0, 1, 2) para cambiar</span>
      </div>

      {/* Cuadrícula Principal */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table ref={tableRef} className="w-full border-collapse text-sm" role="grid">
          <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
            <tr>
              <th className="border-r border-slate-200 px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider w-1/2 sm:w-[110px]">
                HORA
              </th>
              {DIAS_SEMANA.map((dia) => {
                const isVisible = dia === activeMobileDia
                return (
                  <th
                    key={dia}
                    className={`${
                      isVisible ? 'table-cell w-1/2 sm:w-[18%]' : 'hidden sm:table-cell sm:w-[18%]'
                    } border-r last:border-r-0 border-slate-200 px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider`}
                  >
                    {dia}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {MODULOS_HORARIO.map((modulo, moduloIndex) => (
              <tr key={modulo.numeroModulo} className="h-12 sm:h-14">
                <td className="border-r border-slate-200 bg-slate-50 px-2 py-2 font-bold text-xs sm:text-sm text-slate-700 text-center whitespace-nowrap w-1/2 sm:w-[110px]">
                  {modulo.horaInicio}
                </td>

                {DIAS_SEMANA.map((dia, diaIndex) => {
                  const celda = grilla.find((item) => item.dia === dia && item.numeroModulo === modulo.numeroModulo)
                  const estaSeleccionada =
                    seleccionada != null &&
                    seleccionada.diaIndex === diaIndex &&
                    seleccionada.moduloIndex === moduloIndex
                  const isVisibleInMobile = dia === activeMobileDia

                  if (celda == null) return null

                  return (
                    <DisponibilidadCell
                      key={`${dia}-${modulo.numeroModulo}`}
                      celda={celda}
                      isSelected={estaSeleccionada}
                      isVisibleInMobile={isVisibleInMobile}
                      onClick={handleClick}
                      onKeyDown={handleKeyDown}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
