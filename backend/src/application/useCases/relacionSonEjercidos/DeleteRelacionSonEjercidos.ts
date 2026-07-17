import { type RSonEjercidosRepository } from '../../ports/RSonEjercidosRepository.js'

export class DeleteRelacionSonEjercidos {
  private readonly repository: RSonEjercidosRepository

  constructor (repository: RSonEjercidosRepository) {
    this.repository = repository
  }

  async execute (codLab: number, codAsig: string, term: string): Promise<void> {
    if (isNaN(codLab) || codLab <= 0) {
      throw new Error('El código de laboratorio (codLab) es obligatorio y debe ser un número válido')
    }
    if (codAsig === undefined || codAsig === null || codAsig.trim() === '') {
      throw new Error('El código de la materia (codAsig) es obligatorio para eliminar')
    }
    if (term === undefined || term === null || term.trim() === '') {
      throw new Error('El término (term) es obligatorio para eliminar')
    }

    await this.repository.delete(codLab, codAsig, term)
  }
}
