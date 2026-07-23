import { type RImparteRepository } from '../../ports/RImparteRepository.js'
import { type MateriaRepository } from '../../ports/MateriaRepository.js'

export class ClearTermUseCase {
  constructor (
    private readonly imparteRepository: RImparteRepository,
    private readonly materiaRepository: MateriaRepository
  ) {}

  async execute (term: string, tx?: any): Promise<void> {
    if (term.trim() === '') {
      throw new Error('El término es obligatorio para limpiar los datos asociados')
    }
    // Borrar de Imparten para evitar violaciones de clave foránea
    await this.imparteRepository.deleteByTerm(term, tx)
    // Borrar de Plan_de_Estudio
    await this.materiaRepository.deleteByTerm(term, tx)
  }
}
