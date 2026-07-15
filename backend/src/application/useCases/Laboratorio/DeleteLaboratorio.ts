import { type LaboratorioRepository } from '../../ports/LaboratorioRepository.js'

export class DeleteLaboratorio {
  constructor (private readonly repository: LaboratorioRepository) {}

  async execute (id: number): Promise<void> {
    await this.repository.delete(id)
  }
}
