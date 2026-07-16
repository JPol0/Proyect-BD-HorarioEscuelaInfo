import { type Imparte } from '../../../domain/Imparte'
import { type RImparteRepository } from '../../ports/RImparteRepository'

export class GetRelacionesImparteByMateria {
  private readonly repository: RImparteRepository

  constructor (repository: RImparteRepository) {
    this.repository = repository
  }

  async execute (term: string, codAsig: string): Promise<Imparte[]> {
    return await this.repository.getByMateria(term, codAsig)
  }
}
