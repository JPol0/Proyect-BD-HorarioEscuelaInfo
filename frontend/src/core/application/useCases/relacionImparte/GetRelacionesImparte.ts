import { type Imparte } from '../../../domain/Imparte'
import { type RImparteRepository } from '../../ports/RImparteRepository'

export class GetRelacionesImparte {
  private readonly repository: RImparteRepository

  constructor (repository: RImparteRepository) {
    this.repository = repository
  }

  async execute (term: string): Promise<Imparte[]> {
    return await this.repository.getAll(term)
  }
}
