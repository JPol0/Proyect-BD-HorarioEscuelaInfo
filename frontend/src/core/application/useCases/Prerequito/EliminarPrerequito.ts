import { type PrerequitoRepository } from '../../ports/PrerequitoRepository'

export class EliminarPrerequito {
  private readonly repository: PrerequitoRepository

  constructor (repository: PrerequitoRepository) {
    this.repository = repository
  }

  async execute (
    codigoAsignatura: string,
    codigoAsignaturaPrerequito: string,
    term: string
  ): Promise<void> {
    if (codigoAsignatura.trim() === '') {
      throw new Error('El código de asignatura es requerido')
    }
    if (codigoAsignaturaPrerequito.trim() === '') {
      throw new Error('El código del prerrequisito es requerido')
    }
    if (term.trim() === '') {
      throw new Error('El término es requerido')
    }

    await this.repository.eliminar(
      codigoAsignatura,
      codigoAsignaturaPrerequito,
      term
    )
  }
}
