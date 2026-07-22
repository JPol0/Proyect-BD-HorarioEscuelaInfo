import { type Prerequito } from '../../../domain/Prerequito'
import { type PrerequitoRepository } from '../../ports/PrerequitoRepository'

export class ObtenerPrerequitosPorMateria {
  private readonly repository: PrerequitoRepository

  constructor (repository: PrerequitoRepository) {
    this.repository = repository
  }

  async execute (codigoAsignatura: string, term: string): Promise<Prerequito[]> {
    if (codigoAsignatura.trim() === '') {
      throw new Error('El código de la asignatura es requerido')
    }
    if (term.trim() === '') {
      throw new Error('El término es requerido')
    }
    return await this.repository.obtenerPorMateria(codigoAsignatura, term)
  }
}
