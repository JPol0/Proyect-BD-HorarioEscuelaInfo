import type { DisponibilidadLaboratorio } from '../../../domain/DisponibilidadLaboratorio'
import { DIAS_SEMANA } from '../../../domain/DisponibilidadHoraria'
import type { DisponibilidadLaboratorioRepository } from '../../ports/DisponibilidadLaboratorioRepository'

export const HORAS_LABORATORIO = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00'
]

export class ObtenerDisponibilidadLaboratorio {
  private readonly repository: DisponibilidadLaboratorioRepository

  constructor (repository: DisponibilidadLaboratorioRepository) {
    this.repository = repository
  }

  async execute (idLaboratorio: number, codTerm: string): Promise<DisponibilidadLaboratorio[]> {
    const registros = await this.repository.obtenerPorLaboratorioYTerm(idLaboratorio, codTerm)

    const grillaCompleta: DisponibilidadLaboratorio[] = []

    for (const dia of DIAS_SEMANA) {
      for (const hora of HORAS_LABORATORIO) {
        const celdaExistente = registros.find(
          (registro) => registro.dia === dia && registro.hora === hora
        )

        if (celdaExistente != null) {
          grillaCompleta.push(celdaExistente)
          continue
        }

        grillaCompleta.push({
          idLaboratorio,
          dia,
          hora,
          ocupado: false
        })
      }
    }

    return grillaCompleta
  }
}
