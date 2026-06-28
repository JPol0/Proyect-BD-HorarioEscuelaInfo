import { type Materia } from '../../../domain/Materia'
import { type MateriaRepository } from '../../ports/MateriaRepository'

export class GetMaterias {
  private readonly repository: MateriaRepository

  constructor (repository: MateriaRepository) {
    this.repository = repository
  }

  async execute (): Promise<Materia[]> {
    return await this.repository.getMaterias()
  }
}
