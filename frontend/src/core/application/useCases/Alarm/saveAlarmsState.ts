import { type Alerta } from '../../../domain/Alarm'
import { type AlertRepository } from '../../ports/AlertRepository'

export class GuardarEstadoAlerta {
  private readonly repository: AlertRepository

  constructor (repository: AlertRepository) {
    this.repository = repository
  }

  async execute (term: string, alert: Alerta): Promise<void> {
    await this.repository.save(term, alert)
  }
}
