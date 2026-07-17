import { type Seccion } from '../../../domain/Seccion.js'
import { type SeccionRepository } from '../../ports/SeccionRepository.js'

export class GetSeccion {
  private readonly repository: SeccionRepository

  constructor (repository: SeccionRepository) {
    this.repository = repository
  }

  async execute (codTerm: string, codMateria: string, nroSeccion: number): Promise<Seccion | null> {
    if (!codTerm || !codMateria || !nroSeccion) {
      throw new Error('Term, materia y número de sección son requeridos')
    }
    return await this.repository.getSeccion(codTerm, codMateria, nroSeccion)
  }
}
