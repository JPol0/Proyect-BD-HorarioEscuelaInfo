import { type Alerta } from '../../domain/Alarm'
import { type AlertRepository } from '../ports/AlertRepository'

export class ObtenerAlertasPendientes {
  private readonly repository: AlertRepository

  constructor (repository: AlertRepository) {
    this.repository = repository
  }

  async execute (): Promise<Alerta[]> {
    return await this.repository.getAlarmsPending()
  }
}
