import { type HorarioRepository } from '../../ports/HorarioRepository'
import { type Horario } from '../../../domain/Horario'

export class GuardarHorario {
  private readonly repository: HorarioRepository

  constructor (repository: HorarioRepository) {
    this.repository = repository
  }

  async execute (term: string, horario: Horario[]): Promise<void> {
    if (!this.repository.saveSchedule) {
      throw new Error('El repositorio no implementa saveSchedule')
    }
    await this.repository.saveSchedule(term, horario)
  }
}
