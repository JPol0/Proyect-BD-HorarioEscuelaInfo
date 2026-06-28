import { type TermRepository } from '../../ports/TermRepository.js'

export class ToggleTermArchive {
  private readonly repository: TermRepository

  constructor (repository: TermRepository) {
    this.repository = repository
  }

  async execute (id: string, archived: boolean): Promise<void> {
    await this.repository.toggleArchive(id, archived)
  }
}
