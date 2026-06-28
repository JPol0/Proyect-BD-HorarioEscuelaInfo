import { type EstadoAlerta } from '../../../domain/Alarm'
import { type AlertRepository } from '../../ports/AlertRepository'

export class GuardarEstadoAlerta {
  private readonly repository: AlertRepository

  constructor (repository: AlertRepository) {
    this.repository = repository
  }

  async execute (id: string, estado: EstadoAlerta, motivo?: string): Promise<void> {
    await this.repository.saveEstate(id, estado, motivo)
  }
}
