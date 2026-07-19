import type { SeccionRepository } from '../../ports/SeccionRepository'
import type { Seccion } from '../../../domain/Seccion'

export class SaveSeccion {
  private readonly repository: SeccionRepository

  constructor (repository: SeccionRepository) {
    this.repository = repository
  }

  async execute (seccion: Seccion, term: string): Promise<void> {
    await this.repository.saveSeccion(seccion, term)
  }
}
