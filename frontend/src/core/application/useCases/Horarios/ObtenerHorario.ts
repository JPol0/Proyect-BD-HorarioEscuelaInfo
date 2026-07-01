import type { HorarioRepository } from '../../ports/HorarioRepository'
import type { Horario } from '../../../domain/Horario'

export class ObtenerHorario {
  private readonly repository: HorarioRepository
  constructor (repository: HorarioRepository) {
    this.repository = repository
  }

  async execute (term: string): Promise<Horario[]> {
    return await this.repository.getScheduleByTerm(term)
  }
}
