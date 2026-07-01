import { type LaboratorioRepository } from '../../ports/LaboratorioRepository.js'
import { type Laboratorio } from '../../../domain/Laboratorio.js'

export class GetLaboratorios {
  constructor (private readonly repository: LaboratorioRepository) {}

  async execute (): Promise<Laboratorio[]> {
    return await this.repository.getAll()
  }
}
