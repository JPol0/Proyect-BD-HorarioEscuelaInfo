import type { SeccionRepository } from '../../ports/SeccionRepository'
import type { Seccion } from '../../../domain/Seccion'

export class GetSecciones {
  private readonly repository: SeccionRepository

  constructor (repository: SeccionRepository) {
    this.repository = repository
  }

  async execute (codTerm: string, codMateria: string): Promise<Seccion[]> {
    return await this.repository.getSecciones(codTerm, codMateria)
  }
}
