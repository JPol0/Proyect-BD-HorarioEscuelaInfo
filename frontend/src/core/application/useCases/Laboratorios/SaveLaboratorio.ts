import { type LaboratorioRepository } from '../../ports/LaboratorioRepository'
import { type Laboratorio } from '../../../domain/Laboratorio'

export class SaveLaboratorio {
  constructor (private readonly repository: LaboratorioRepository) {}

  async execute (laboratorio: Laboratorio): Promise<Laboratorio> {
    await this.repository.save(laboratorio)
    return laboratorio
  }
}
