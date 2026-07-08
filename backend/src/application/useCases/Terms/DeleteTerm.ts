import { type TermRepository } from '../../ports/TermRepository.js'

export class DeleteTerm {
  private readonly repository: TermRepository

  constructor (repository: TermRepository) {
    this.repository = repository
  }

  async execute (id: string): Promise<void> {
    await this.repository.deleteTerm(id)
  }
}
