import type { ProfesorRepository } from '../../ports/ProfesorRepository'
import type { Profesor } from '../../../domain/Profesor'

export class GetProfesores {
  private readonly repository: ProfesorRepository

  constructor (repository: ProfesorRepository) {
    this.repository = repository
  }

  async execute (): Promise<Profesor[]> {
    return await this.repository.getProfesores()
  }
}
