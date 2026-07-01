import { type MateriaRepository } from '../../ports/MateriaRepository.js'

export class DeleteMateria {
  private readonly repository: MateriaRepository

  constructor (repository: MateriaRepository) {
    this.repository = repository
  }

  async execute (codMateria: string): Promise<void> {
    await this.repository.delete(codMateria)
  }
}
