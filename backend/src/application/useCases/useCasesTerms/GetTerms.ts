import { type Term } from '../../../domain/Term.js'
import { type TermRepository } from '../../ports/TermRepository.js'

export class GetTerms {
  private readonly repository: TermRepository

  constructor (repository: TermRepository) {
    this.repository = repository
  }

  async execute (): Promise<Term[]> {
    return await this.repository.getTerms()
  }
}
