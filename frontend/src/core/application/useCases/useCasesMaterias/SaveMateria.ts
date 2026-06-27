import { type Materia } from '../../../domain/Materia'
import { type MateriaRepository } from '../../ports/MateriaRepository'

export class SaveMateria {
  private readonly repository: MateriaRepository

  constructor (repository: MateriaRepository) {
    this.repository = repository
  }

  async execute (materia: Materia): Promise<void> {
    await this.repository.saveMateria(materia)
  }
}
