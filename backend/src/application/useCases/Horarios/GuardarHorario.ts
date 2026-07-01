import { type HorarioRepository } from '../../ports/HorarioRepository.js'
import { type Horario } from '../../../domain/Horario.js'

export class GuardarHorario {
  constructor (private readonly repository: HorarioRepository) {}

  async execute (term: string, schedule: Horario[]): Promise<void> {
    await this.repository.saveSchedule(term, schedule)
  }
}
