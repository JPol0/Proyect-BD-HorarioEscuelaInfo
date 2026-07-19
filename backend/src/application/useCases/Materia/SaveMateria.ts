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

  async execute (term: string, materia: Materia, tx?: any): Promise<void> {
    const isNewCode = materia.codMateria === undefined || materia.codMateria.trim() === ''
    const codMateria = isNewCode ? randomUUID() : materia.codMateria

    const materiaToSave: Materia = {
      ...materia,
      codMateria
    }

    const saveOperation = async (currentTx: any) => {
      let exists = false
      if (!isNewCode) {
        const existingMateria = await this.materiaRepository.getById(term, codMateria, currentTx)
        if (existingMateria !== null) {
          exists = true
        }
      }

      // Guardar/Upsert la materia
      await this.materiaRepository.save(term, materiaToSave, currentTx)

      // Si es una materia nueva, auto-generar las secciones
      if (!exists) {
        for (let i = 1; i <= materiaToSave.nroSecciones; i++) {
          await this.seccionRepository.saveSeccion({
            codTerm: term,
            codMateria: codMateria,
            nroSeccion: 0 // serial autogenerado
          }, currentTx)
        }
      }
    }

    if (tx !== undefined) {
      await saveOperation(tx)
    } else {
      await this.transactionManager.run(async (clientTx) => {
        await saveOperation(clientTx)
      })
    }
  }
}
