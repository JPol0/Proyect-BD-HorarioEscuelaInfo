import type { ProfesorRepository } from '../../ports/ProfesorRepository'
import type { Profesor } from '../../../domain/Profesor'

export class ActualizarStatusProfesor {
  private readonly repository: ProfesorRepository

  constructor (repository: ProfesorRepository) {
    this.repository = repository
  }

  async execute (cedula: string, status: Profesor['status']): Promise<Profesor> {
    return await this.repository.actualizarStatus(cedula, status)
  }
}
