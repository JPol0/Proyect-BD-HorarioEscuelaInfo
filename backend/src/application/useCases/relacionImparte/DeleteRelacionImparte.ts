import { type RImparteRepository } from '../../ports/RImparteRepository.js'

export class DeleteRelacionImparte {
  private readonly repository: RImparteRepository

  constructor (repository: RImparteRepository) {
    this.repository = repository
  }

  async execute (cedulaP: string, codAsig: string, term: string, nroSeccion: number): Promise<void> {
    if (cedulaP.trim() === '') {
      throw new Error('La cédula del profesor es requerida para eliminar')
    }
    if (codAsig.trim() === '') {
      throw new Error('El código de asignatura es requerido para eliminar')
    }
    if (term.trim() === '') {
      throw new Error('El término es requerido para eliminar')
    }
    if (isNaN(nroSeccion) || nroSeccion <= 0) {
      throw new Error('El número de sección debe ser un número entero válido y mayor a 0 para eliminar')
    }

    await this.repository.delete(cedulaP, codAsig, term, nroSeccion)
  }
}
