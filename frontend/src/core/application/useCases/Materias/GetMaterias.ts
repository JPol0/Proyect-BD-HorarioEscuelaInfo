import { type Materia } from '../../../domain/Materia'
import { type MateriaRepository } from '../../ports/MateriaRepository'

export class GetMaterias {
  private readonly repository: MateriaRepository

  constructor (repository: MateriaRepository) {
    this.repository = repository
  }

  async execute (term: string): Promise<Materia[]> {
    return await this.repository.getMaterias(term)
  }
}
