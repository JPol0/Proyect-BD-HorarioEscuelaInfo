import { type Term } from '../../domain/Term'
import { type TermRepository } from '../ports/TermRepository'

export class GetTerms {
  private readonly repository: TermRepository

  constructor (repository: TermRepository) {
    this.repository = repository
  }

  async execute (): Promise<Term[]> {
    return await this.repository.getTerms()
  }
}
