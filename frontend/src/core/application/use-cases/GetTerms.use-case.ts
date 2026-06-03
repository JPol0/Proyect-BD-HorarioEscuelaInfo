import type { Term } from '../../domain/entities/Term'
import type { TermRepository } from '../../domain/ports/TermRepository.port'

export class GetTermsUseCase {
  constructor (private readonly termRepository: TermRepository) {}

  async execute (): Promise<Term[]> {
    return await this.termRepository.getAll()
  }
}
