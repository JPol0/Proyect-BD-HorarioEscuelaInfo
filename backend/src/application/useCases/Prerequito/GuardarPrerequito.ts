import { type PrerequitoRepository } from '../../ports/PrerequitoRepository.js'
import { type Prerequito } from '../../../domain/Prerequito.js'

export class GuardarPrerequito {
  constructor (private readonly repository: PrerequitoRepository) {}

  async execute (prerequito: Prerequito, tx?: any): Promise<void> {
    if (prerequito.codigoAsignatura.trim() === '') {
      throw new Error('El código de asignatura es requerido')
    }
    if (prerequito.codigoTermAsignatura.trim() === '') {
      throw new Error('El término de la asignatura es requerido')
    }
    if (prerequito.codigoAsignaturaPrerequito.trim() === '') {
      throw new Error('El código de asignatura del prerrequisito es requerido')
    }
    if (prerequito.codigoTermPrerequito.trim() === '') {
      throw new Error('El término del prerrequisito es requerido')
    }

    await this.repository.guardar(prerequito, tx)
  }
}
