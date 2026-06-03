import type { Term } from '../../domain/entities/Term.js'
import type { TermRepository } from '../../domain/ports/TermRepository.js'

export class GetAllTerms {
  constructor (private readonly termRepository: TermRepository) {}

  async execute (): Promise<Term[]> {
    return await this.termRepository.findAll()
  }
}
