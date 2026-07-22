import type { DisponibilidadLaboratorio } from '../../../domain/DisponibilidadLaboratorio'
import type { DisponibilidadLaboratorioRepository } from '../../ports/DisponibilidadLaboratorioRepository'
import { DIAS_SEMANA } from '../../../domain/DisponibilidadHoraria'
import { HORAS_LABORATORIO } from './ObtenerDisponibilidadLaboratorio'

const DIAS_VALIDOS = new Set<string>(DIAS_SEMANA)
const HORAS_VALIDAS = new Set<string>(HORAS_LABORATORIO)

export class GuardarDisponibilidadLaboratorio {
  private readonly repository: DisponibilidadLaboratorioRepository

  constructor (repository: DisponibilidadLaboratorioRepository) {
    this.repository = repository
  }

  async execute (idLaboratorio: number, codTerm: string, grilla: DisponibilidadLaboratorio[]): Promise<void> {
    for (const celda of grilla) {
      if (!DIAS_VALIDOS.has(celda.dia)) {
        throw new Error(`Dia inválido: ${celda.dia}`)
      }

      if (!HORAS_VALIDAS.has(celda.hora)) {
        throw new Error(`Hora inválida: ${celda.hora}`)
      }
    }

    await this.repository.guardar(idLaboratorio, codTerm, grilla)
  }
}
