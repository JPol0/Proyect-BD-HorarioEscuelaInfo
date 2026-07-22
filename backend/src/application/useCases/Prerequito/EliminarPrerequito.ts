import { type PrerequitoRepository } from '../../ports/PrerequitoRepository.js'

export class EliminarPrerequito {
  constructor (private readonly repository: PrerequitoRepository) {}

  async execute (
    codigoAsignatura: string,
    codigoTermAsignatura: string,
    codigoAsignaturaPrerequito: string,
    codigoTermPrerequito: string,
    tx?: any
  ): Promise<void> {
    if (codigoAsignatura.trim() === '') {
      throw new Error('El código de asignatura es requerido')
    }
    if (codigoTermAsignatura.trim() === '') {
      throw new Error('El término de la asignatura es requerido')
    }
    if (codigoAsignaturaPrerequito.trim() === '') {
      throw new Error('El código de asignatura del prerrequisito es requerido')
    }
    if (codigoTermPrerequito.trim() === '') {
      throw new Error('El término del prerrequisito es requerido')
    }

    await this.repository.eliminar(
      codigoAsignatura,
      codigoTermAsignatura,
      codigoAsignaturaPrerequito,
      codigoTermPrerequito,
      tx
    )
  }
}
