import { type LaboratorioRepository } from '../../ports/LaboratorioRepository'

export class DeleteLaboratorio {
  private readonly repository: LaboratorioRepository

  constructor (repository: LaboratorioRepository) {
    this.repository = repository
  }

  async execute (id: number): Promise<void> {
    await this.repository.delete(id)
  }
}
