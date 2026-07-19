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
      // Guardar/Upsert la materia
      await this.materiaRepository.save(term, materiaToSave, currentTx)

      // Sincronizar las secciones en la base de datos
      const existingSecciones = await this.seccionRepository.getSecciones(term, codMateria, currentTx)
      const existingCount = existingSecciones.length

      if (materiaToSave.nroSecciones > existingCount) {
        // Agregar las secciones que faltan
        for (let i = existingCount + 1; i <= materiaToSave.nroSecciones; i++) {
          await this.seccionRepository.saveSeccion({
            codTerm: term,
            codMateria: codMateria,
            nroSeccion: i
          }, currentTx)
        }
      } else if (materiaToSave.nroSecciones < existingCount) {
        // Eliminar las secciones sobrantes
        for (let i = existingCount; i > materiaToSave.nroSecciones; i--) {
          await this.seccionRepository.deleteSeccion(term, codMateria, i, currentTx)
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
