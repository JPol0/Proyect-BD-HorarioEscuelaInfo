import { type SonEjercidos } from '../../../domain/SonEjercidos'
import { type RSonEjercidosRepository } from '../../ports/RSonEjercidosRepository'

export class GetRelacionesSonEjercidosByMateria {
  private readonly repository: RSonEjercidosRepository

  constructor (repository: RSonEjercidosRepository) {
    this.repository = repository
  }

  async execute (term: string, codAsig: string): Promise<SonEjercidos[]> {
    return await this.repository.getByMateria(term, codAsig)
  }
}
