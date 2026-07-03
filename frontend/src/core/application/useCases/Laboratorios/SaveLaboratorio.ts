import { type LaboratorioRepository } from '../../ports/LaboratorioRepository'
import { type Laboratorio } from '../../../domain/Laboratorio'

export class SaveLaboratorio {
  private readonly repository: LaboratorioRepository

  constructor (repository: LaboratorioRepository) {
    this.repository = repository
  }

  async execute (laboratorio: Laboratorio): Promise<Laboratorio> {
    await this.repository.save(laboratorio)
    return laboratorio
  }
}
