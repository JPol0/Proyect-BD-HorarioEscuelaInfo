import { HorarioRepository } from '../../ports/HorarioRepository.js'
import { type Horario } from '../../../domain/Horario.js'

export class ObtenerHorario {
  constructor (private readonly repository: HorarioRepository) {}

  async execute (term: string): Promise<Horario[] | null> {
    return await this.repository.getScheduleByTerm(term)
  }
}
