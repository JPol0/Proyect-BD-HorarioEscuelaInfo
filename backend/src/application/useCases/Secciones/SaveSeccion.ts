import { type Seccion } from '../../../domain/Seccion.js'
import { type SeccionRepository } from '../../ports/SeccionRepository.js'

export class SaveSeccion {
  private readonly repository: SeccionRepository

  constructor (repository: SeccionRepository) {
    this.repository = repository
  }

  async execute (seccion: Seccion): Promise<void> {
    if (!seccion.codTerm || !seccion.codMateria) {
      throw new Error('El término y la materia son obligatorios para crear una sección')
    }
    await this.repository.saveSeccion(seccion)
  }
}
