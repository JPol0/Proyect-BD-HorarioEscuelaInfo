import { type PrerequitoRepository } from '../../ports/PrerequitoRepository.js'
import { type Prerequito } from '../../../domain/Prerequito.js'

export class ObtenerPrerequitosPorTerm {
  constructor (private readonly repository: PrerequitoRepository) {}

  async execute (codigoTermAsignatura: string): Promise<Prerequito[]> {
    if (codigoTermAsignatura.trim() === '') {
      throw new Error('El término de la asignatura es requerido')
    }

    return await this.repository.obtenerPorTerm(codigoTermAsignatura)
  }
}
