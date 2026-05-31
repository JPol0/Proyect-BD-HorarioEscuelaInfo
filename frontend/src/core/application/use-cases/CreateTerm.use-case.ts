import type { CreateTermInput, TermRepository } from '../../domain/ports/TermRepository.port'
import type { Term } from '../../domain/entities/Term'

export class CreateTermUseCase {
  constructor (private readonly termRepository: TermRepository) {}

  async execute (input: CreateTermInput): Promise<Term> {
    return await this.termRepository.create(input)
  }
}
