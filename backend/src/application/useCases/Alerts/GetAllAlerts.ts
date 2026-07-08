import { type Alert } from '../../../domain/Alert.js'
import { type AlertRepository } from '../../ports/AlertRepository.js'

export class GetAllAlerts {
  private readonly repository: AlertRepository

  constructor (repository: AlertRepository) {
    this.repository = repository
  }

  async execute (term: string): Promise<Alert[]> {
    return await this.repository.getAllAlerts(term)
  }
}
