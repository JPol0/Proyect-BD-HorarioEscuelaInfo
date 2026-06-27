import { type Materia } from '../../../domain/Materia.js'
import { type MateriaRepository } from '../../ports/MateriaRepository.js'

export class SaveMateria {
  private readonly repository: MateriaRepository

  constructor (repository: MateriaRepository) {
    this.repository = repository
  }

  async execute (materia: Materia): Promise<void> {
    await this.repository.save(materia)
  }
}
