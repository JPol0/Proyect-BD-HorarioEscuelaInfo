import { type AlertState } from '../../../domain/Alert.js'
import { type AlertRepository } from '../../ports/AlertRepository.js'

export class SaveAlertState {
  private readonly repository: AlertRepository

  constructor (repository: AlertRepository) {
    this.repository = repository
  }

  async execute (id: string, estado: AlertState, motivo?: string): Promise<void> {
    await this.repository.saveState(id, estado, motivo)
  }
}
