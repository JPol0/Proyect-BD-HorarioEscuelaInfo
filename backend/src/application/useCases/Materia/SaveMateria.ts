import { randomUUID } from 'crypto'
import { type Materia } from '../../../domain/Materia.js'
import { type MateriaRepository } from '../../ports/MateriaRepository.js'
import { type SeccionRepository } from '../../ports/SeccionRepository.js'
import { type TransactionManager } from '../../ports/TransactionManager.js'

export class SaveMateria {
  constructor (
    private readonly materiaRepository: MateriaRepository,
    private readonly seccionRepository: SeccionRepository,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute (term: string, materia: Materia): Promise<void> {
    const isNewCode = materia.codMateria === undefined || materia.codMateria.trim() === ''
    const codMateria = isNewCode ? randomUUID() : materia.codMateria

    const materiaToSave: Materia = {
      ...materia,
      codMateria
    }

    await this.transactionManager.run(async (tx) => {
      let exists = false
      if (!isNewCode) {
        const existingMateria = await this.materiaRepository.getById(term, codMateria, tx)
        if (existingMateria !== null) {
          exists = true
        }
      }

      // Guardar/Upsert la materia
      await this.materiaRepository.save(term, materiaToSave, tx)

      // Si es una materia nueva, auto-generar las secciones
      if (!exists) {
        for (let i = 1; i <= materiaToSave.nroSecciones; i++) {
          await this.seccionRepository.saveSeccion({
            codTerm: term,
            codMateria: codMateria,
            nroSeccion: 0 // serial autogenerado
          }, tx)
        }
      }
    })
  }
}
