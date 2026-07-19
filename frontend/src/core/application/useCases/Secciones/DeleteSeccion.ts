import { type SeccionRepository } from '../../ports/SeccionRepository'

export class DeleteSeccion {
  private readonly repository: SeccionRepository

  constructor (repository: SeccionRepository) {
    this.repository = repository
  }

  async execute (codTerm: string, codMateria: string, nroSeccion: number): Promise<void> {
    if (!codMateria || !codTerm) {
      throw new Error('La materia y el semestre son obligatorios para eliminar una sección')
    }
    await this.repository.deleteSeccion(codTerm, codMateria, nroSeccion)
  }
}
