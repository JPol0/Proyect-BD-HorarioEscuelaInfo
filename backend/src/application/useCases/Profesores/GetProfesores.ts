import type { Profesor } from '../../../domain/Profesor.js'
import type { ProfesorRepository } from '../../ports/ProfesorRepository.js'

export class GetProfesores {
  constructor (private readonly repository: ProfesorRepository) {}

  async execute (): Promise<Profesor[]> {
    return await this.repository.obtenerTodos()
  }
}
