import { type Seccion } from '../../../domain/Seccion.js'
import { type SeccionRepository } from '../../ports/SeccionRepository.js'

export class SaveSeccion {
  private readonly repository: SeccionRepository

  constructor (repository: SeccionRepository) {
    this.repository = repository
  }

  async execute (seccion: Seccion, tx?: any): Promise<void> {
    if (seccion.codTerm.trim() === '' || seccion.codMateria.trim() === '') {
      throw new Error('El término y la materia son obligatorios para crear una sección')
    }
    await this.repository.saveSeccion(seccion, tx)
  }
}
