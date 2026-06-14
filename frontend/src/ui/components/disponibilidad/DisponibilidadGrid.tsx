import type { JSX } from 'react'
import type { DiaSemana, DisponibilidadHoraria } from '../../../core/domain/DisponibilidadHoraria'
import { DIAS_SEMANA, MODULOS_HORARIO } from '../../../core/domain/DisponibilidadHoraria'
import { DisponibilidadCell } from './DisponibilidadCell'

interface DisponibilidadGridProps {
  grilla: DisponibilidadHoraria[]
  onCeldaClick: (dia: DiaSemana, numeroModulo: number) => void
}

export function DisponibilidadGrid ({ grilla, onCeldaClick }: DisponibilidadGridProps): JSX.Element {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="border border-slate-200 px-3 py-2 text-left">HORA</th>
            {DIAS_SEMANA.map((dia) => (
              <th key={dia} className="border border-slate-200 px-3 py-2 text-center">{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODULOS_HORARIO.map((modulo) => (
            <tr key={modulo.numeroModulo}>
              <td className="border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-600">
                {modulo.horaInicio}
              </td>
              {DIAS_SEMANA.map((dia) => {
                const celda = grilla.find((item) => item.dia === dia && item.numeroModulo === modulo.numeroModulo)
                return celda != null ? (
                  <DisponibilidadCell key={`${dia}-${modulo.numeroModulo}`} celda={celda} onClick={onCeldaClick} />
                ) : null
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
