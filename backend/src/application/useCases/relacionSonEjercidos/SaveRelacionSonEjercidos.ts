import { type SonEjercidos } from '../../../domain/SonEjercidos.js'
import { type RSonEjercidosRepository } from '../../ports/RSonEjercidosRepository.js'

export class SaveRelacionSonEjercidos {
  private readonly repository: RSonEjercidosRepository

  constructor (repository: RSonEjercidosRepository) {
    this.repository = repository
  }

  async execute (sonEjercidos: SonEjercidos): Promise<void> {
    if (sonEjercidos.prioridad !== 1 && sonEjercidos.prioridad !== 2) {
      throw new Error('La prioridad de laboratorio debe ser 1 o 2')
    }

    if (sonEjercidos.codLab === undefined || sonEjercidos.codLab === null || typeof sonEjercidos.codLab !== 'number' || isNaN(sonEjercidos.codLab) || sonEjercidos.codLab <= 0) {
      throw new Error('El código de laboratorio (codLab) debe ser un número válido')
    }

    if (sonEjercidos.codAsig === undefined || sonEjercidos.codAsig === null || sonEjercidos.codAsig.trim() === '') {
      throw new Error('El código de la materia (codAsig) es obligatorio')
    }

    if (sonEjercidos.codTerm === undefined || sonEjercidos.codTerm === null || sonEjercidos.codTerm.trim() === '') {
      throw new Error('El código del término (codTerm) es obligatorio')
    }

    await this.repository.save(sonEjercidos)
  }
}
