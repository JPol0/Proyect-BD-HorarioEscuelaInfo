import { type Alert } from '../../../domain/Alert.js'
import { type AlertRepository } from '../../ports/AlertRepository.js'

export class GetAlertPending {
  private readonly repository: AlertRepository

  constructor (repository: AlertRepository) {
    this.repository = repository
  }

  async execute (): Promise<Alert[]> {
    return await this.repository.getAlertsPending()
  }
}
