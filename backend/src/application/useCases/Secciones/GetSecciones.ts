import { type Seccion } from '../../../domain/Seccion.js'
import { type SeccionRepository } from '../../ports/SeccionRepository.js'

export class GetSecciones {
  private readonly repository: SeccionRepository

  constructor (repository: SeccionRepository) {
    this.repository = repository
  }

  async execute (codTerm: string, codMateria: string): Promise<Seccion[]> {
    if (!codTerm || !codMateria) {
      throw new Error('El term y la materia son obligatorios para buscar secciones')
    }
    return await this.repository.getSecciones(codTerm, codMateria)
  }
}
