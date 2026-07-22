import { type Prerequito } from '../../../domain/Prerequito'
import { type PrerequitoRepository } from '../../ports/PrerequitoRepository'

export class GuardarPrerequito {
  private readonly repository: PrerequitoRepository

  constructor (repository: PrerequitoRepository) {
    this.repository = repository
  }

  async execute (prerequito: Prerequito, term: string): Promise<void> {
    if (prerequito.codigoAsignatura.trim() === '') {
      throw new Error('El código de asignatura no puede estar vacío.')
    }
    if (prerequito.codigoAsignaturaPrerequito.trim() === '') {
      throw new Error('El código de prerrequisito no puede estar vacío.')
    }
    await this.repository.guardar(prerequito, term)
  }
}
