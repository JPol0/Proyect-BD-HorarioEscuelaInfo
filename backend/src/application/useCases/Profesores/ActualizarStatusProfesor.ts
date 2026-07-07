import type { Profesor } from '../../../domain/Profesor.js'
import type { ProfesorRepository } from '../../ports/ProfesorRepository.js'

export class ActualizarStatusProfesor {
  constructor (private readonly repository: ProfesorRepository) {}

  async execute (cedula: string, status: Profesor['status']): Promise<Profesor> {
    const validos: Profesor['status'][] = ['A', 'P', 'R']
    if (!validos.includes(status)) {
      throw new Error(`Status inválido: ${status}`)
    }
    return await this.repository.actualizarStatus(cedula, status)
  }
}
