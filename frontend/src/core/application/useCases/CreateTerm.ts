import { type Term } from '../../domain/Term'
import { type TermRepository, type CreateTermInput } from '../ports/TermRepository'

export class CreateTerm {
  private readonly repository: TermRepository

  constructor (repository: TermRepository) {
    this.repository = repository
  }

  async execute (input: CreateTermInput): Promise<Term> {
    return await this.repository.createTerm(input)
  }
}
