import { type LaboratorioRepository } from '../../ports/LaboratorioRepository.js'
import { type Laboratorio } from '../../../domain/Laboratorio.js'

export class SaveLaboratorio {
  constructor (private readonly repository: LaboratorioRepository) {}

  async execute (laboratorio: Laboratorio): Promise<void> {
    if (laboratorio.name.trim() === '') {
      throw new Error('El nombre del laboratorio es obligatorio')
    }
    await this.repository.save(laboratorio)
  }
}
