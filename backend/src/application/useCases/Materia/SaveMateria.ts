import { randomUUID } from 'crypto'
import { type Materia } from '../../../domain/Materia.js'
import { type MateriaRepository } from '../../ports/MateriaRepository.js'

export class SaveMateria {
  private readonly repository: MateriaRepository

  constructor (repository: MateriaRepository) {
    this.repository = repository
  }

  async execute (materia: Materia): Promise<void> {
    const codMateria = (materia.codMateria === undefined || materia.codMateria.trim() === '')
      ? randomUUID()
      : materia.codMateria

    const materiaToSave: Materia = {
      ...materia,
      codMateria
    }

    await this.repository.save(materiaToSave)
  }
}
