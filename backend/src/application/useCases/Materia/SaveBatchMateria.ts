import { type Materia } from '../../../domain/Materia.js'
import { type SaveMateria } from './SaveMateria.js'
import { type TransactionManager } from '../../ports/TransactionManager.js'

export class SaveBatchMateria {
  constructor (
    private readonly saveMateria: SaveMateria,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute (term: string, materias: Materia[], tx?: any): Promise<void> {
    const operation = async (currentTx: any) => {
      for (const materia of materias) {
        await this.saveMateria.execute(term, materia, currentTx)
      }
    }

    if (tx !== undefined) {
      await operation(tx)
    } else {
      await this.transactionManager.run(async (clientTx) => {
        await operation(clientTx)
      })
    }
  }
}
