import { type PrerequitoRepository } from '../../ports/PrerequitoRepository.js'
import { type Prerequito } from '../../../domain/Prerequito.js'

export class ObtenerPrerequitosPorMateria {
  constructor (private readonly repository: PrerequitoRepository) {}

  async execute (codigoAsignatura: string, codigoTermAsignatura: string): Promise<Prerequito[]> {
    if (codigoAsignatura.trim() === '') {
      throw new Error('El código de asignatura es requerido')
    }
    if (codigoTermAsignatura.trim() === '') {
      throw new Error('El término de la asignatura es requerido')
    }

    return await this.repository.obtenerPorMateria(codigoAsignatura, codigoTermAsignatura)
  }
}
