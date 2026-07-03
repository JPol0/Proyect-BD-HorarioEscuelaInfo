import { type LaboratorioRepository } from '../../ports/LaboratorioRepository'
import { type Laboratorio } from '../../../domain/Laboratorio'

export class GetLaboratorios {
  private readonly repository: LaboratorioRepository

  constructor (repository: LaboratorioRepository) {
    this.repository = repository
  }

  async execute (): Promise<Laboratorio[]> {
    return await this.repository.getAll()
  }
}
