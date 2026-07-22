import type { DisponibilidadLaboratorio } from '../../../domain/DisponibilidadLaboratorio.js'
import type { DisponibilidadLaboratorioRepository } from '../../ports/DisponibilidadLaboratorioRepository.js'
import type { TransactionManager } from '../../ports/TransactionManager.js'
import { DIAS_SEMANA } from '../../../domain/DisponibilidadHoraria.js'
import { HORAS_LABORATORIO } from './ObtenerDisponibilidadLaboratorio.js'

const DIAS_VALIDOS = new Set<string>(DIAS_SEMANA)
const HORAS_VALIDAS = new Set<string>(HORAS_LABORATORIO)

export class GuardarDisponibilidadLaboratorio {
  constructor (
    private readonly repository: DisponibilidadLaboratorioRepository,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute (idLaboratorio: number, codTerm: string, grilla: DisponibilidadLaboratorio[]): Promise<void> {
    for (const celda of grilla) {
      if (!DIAS_VALIDOS.has(celda.dia)) {
        throw new Error(`Dia inválido: ${celda.dia}`)
      }

      if (!HORAS_VALIDAS.has(celda.hora)) {
        throw new Error(`Hora inválida: ${celda.hora}`)
      }
    }

    await this.transactionManager.run(async (tx) => {
      // 1. Eliminar todos los registros existentes para este laboratorio y término
      await this.repository.eliminarPorLaboratorioYTerm(idLaboratorio, codTerm, tx)

      // 2. Filtrar solo las celdas que están marcadas como ocupadas
      const celdasOcupadas = grilla.filter((celda) => celda.ocupado)

      // 3. Guardar solo las celdas ocupadas
      await this.repository.guardar(idLaboratorio, codTerm, celdasOcupadas, tx)
    })
  }
}
