import { type AlertRepository } from '../../application/ports/AlertRepository'
import { type Alerta, type EstadoAlerta } from '../../domain/Alarm'

export class HttpAlertRepository implements AlertRepository {
  private readonly apiUrl = 'http://localhost:3000/api/alerts'

  async getAlarmsPending (): Promise<Alerta[]> {
    const response = await fetch(`${this.apiUrl}/pendings`)
    if (!response.ok) {
      throw new Error('Error al conectar con el servidor de horarios')
    }
    return await response.json() as Alerta[]
  }

  async saveEstate (id: string, estado: EstadoAlerta, motivo?: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado, motivo })
    })

    if (!response.ok) {
      const errorData = await response.json() as { error?: string }
      throw new Error(errorData.error ?? 'Error al procesar la solicitud en el servidor')
    }
  }
}
