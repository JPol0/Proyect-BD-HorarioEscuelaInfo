import { type LaboratorioRepository } from '../../ports/LaboratorioRepository'
import { type Laboratorio } from '../../../domain/Laboratorio'

export class GetLaboratorios {
  constructor (private readonly repository: LaboratorioRepository) {}

  async execute (): Promise<Laboratorio[]> {
    return await this.repository.getAll()
  }
}
