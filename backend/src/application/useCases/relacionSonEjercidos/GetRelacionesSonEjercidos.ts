import { type SonEjercidos } from '../../../domain/SonEjercidos.js'
import { type RSonEjercidosRepository } from '../../ports/RSonEjercidosRepository.js'

export class GetRelacionesSonEjercidos {
  private readonly repository: RSonEjercidosRepository

  constructor (repository: RSonEjercidosRepository) {
    this.repository = repository
  }

  async execute (term: string): Promise<SonEjercidos[]> {
    return await this.repository.getAll(term)
  }
}
