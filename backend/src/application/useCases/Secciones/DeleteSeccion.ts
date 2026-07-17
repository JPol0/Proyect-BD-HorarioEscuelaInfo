import { type SeccionRepository } from '../../ports/SeccionRepository.js'

export class DeleteSeccion {
  private readonly repository: SeccionRepository

  constructor (repository: SeccionRepository) {
    this.repository = repository
  }

  async execute (codTerm: string, codMateria: string, nroSeccion: number): Promise<void> {
    if (!codTerm || !codMateria || !nroSeccion) {
      throw new Error('Term, materia y número de sección son requeridos para eliminar')
    }
    await this.repository.deleteSeccion(codTerm, codMateria, nroSeccion)
  }
}
