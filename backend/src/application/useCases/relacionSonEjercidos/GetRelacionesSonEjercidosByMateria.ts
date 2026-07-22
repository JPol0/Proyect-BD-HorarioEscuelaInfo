import { type SonEjercidos } from '../../../domain/SonEjercidos.js'
import { type RSonEjercidosRepository } from '../../ports/RSonEjercidosRepository.js'

export class GetRelacionesSonEjercidosByMateria {
  private readonly repository: RSonEjercidosRepository

  constructor (repository: RSonEjercidosRepository) {
    this.repository = repository
  }

  async execute (term: string, codAsig: string): Promise<SonEjercidos[]> {
    return await this.repository.getByMateria(term, codAsig)
  }
}
