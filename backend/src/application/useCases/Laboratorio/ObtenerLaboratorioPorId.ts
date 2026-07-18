import { type LaboratorioRepository } from '../../ports/LaboratorioRepository.js'
import { type Laboratorio } from '../../../domain/Laboratorio.js'

export class ObtenerLaboratorioPorId {
  constructor (private readonly repository: LaboratorioRepository) {}

  async execute (id: number): Promise<Laboratorio> {
    const laboratorio = await this.repository.getById(id)
    if (laboratorio === null) {
      throw new Error(`No se encontró el laboratorio con ID ${id}`)
    }
    return laboratorio
  }
}
