import { type Imparte } from '../../../domain/Imparte'
import { type RImparteRepository } from '../../ports/RImparteRepository'

export class SaveRelacionImparte {
  private readonly repository: RImparteRepository

  constructor (repository: RImparteRepository) {
    this.repository = repository
  }

  async execute (imparte: Imparte, term: string): Promise<void> {
    if (imparte.cedulaP.trim() === '') {
      throw new Error('La cédula del profesor es requerida')
    }
    if (imparte.codAsig.trim() === '') {
      throw new Error('El código de asignatura es requerido')
    }
    if (term.trim() === '') {
      throw new Error('El código del término es requerido')
    }
    if (imparte.nroSeccion <= 0) {
      throw new Error('El número de sección debe ser mayor a 0')
    }
    if (imparte.horasLab < 0 || imparte.horasTeo < 0) {
      throw new Error('Las horas de teoría y laboratorio no pueden ser negativas')
    }

    await this.repository.save(imparte, term)
  }
}
