import { type SonEjercidos } from '../../../domain/SonEjercidos'
import { type RSonEjercidosRepository } from '../../ports/RSonEjercidosRepository'

export class GetRelacionesSonEjercidos {
  private readonly repository: RSonEjercidosRepository

  constructor (repository: RSonEjercidosRepository) {
    this.repository = repository
  }

  async execute (term: string): Promise<SonEjercidos[]> {
    return await this.repository.getAll(term)
  }
}
