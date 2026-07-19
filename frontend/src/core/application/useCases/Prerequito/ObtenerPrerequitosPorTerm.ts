import { type Prerequito } from '../../../domain/Prerequito'
import { type PrerequitoRepository } from '../../ports/PrerequitoRepository'

export class ObtenerPrerequitosPorTerm {
  private readonly repository: PrerequitoRepository

  constructor (repository: PrerequitoRepository) {
    this.repository = repository
  }

  async execute (term: string): Promise<Prerequito[]> {
    if (term.trim() === '') {
      throw new Error('El término es requerido')
    }
    return await this.repository.obtenerPorTerm(term)
  }
}
